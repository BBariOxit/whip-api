import { workspaceModel } from '~/models/workspaceModel'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { WORKSPACE_ROLES, INVITATION_TTL_DAYS } from '~/utils/constants'
import { buildBoardDocs } from '~/utils/importHelpers'
import { GET_CLIENT, GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

import crypto from 'crypto'
import { env } from '~/config/environment'
import { brevoProvider } from '~/providers/brevoProvider'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'
import { notificationService } from './notificationService'
import { workspaceActivityService } from './workspaceActivityService'
import { NOTIFICATION_TYPES, WORKSPACE_ACTIVITY_TYPES } from '~/utils/constants'
import { cascadeDeletionService } from './cascadeDeletionService'

// Lấy tên hiển thị đẹp cho 1 member (dùng cho targetName trong activity log).
// Member đã có tài khoản -> displayName; member pending -> fallback về email.
const resolveMemberName = async (memberUserId, fallbackEmail) => {
  if (!memberUserId) return fallbackEmail || null
  try {
    const user = await userModel.findOneById(memberUserId)
    return user?.displayName || user?.username || user?.email || fallbackEmail || null
  } catch {
    return fallbackEmail || null
  }
}

const createNew = async (userId, email, reqBody) => {
  try {
    const createdWorkspace = await workspaceModel.createNew(userId, email, reqBody)
    const getNewWorkspace = await workspaceModel.findById(createdWorkspace.insertedId)
    return getNewWorkspace
  } catch (error) {
    throw error
  }
}

const getWorkspacesByUserId = async (userId) => {
  try {
    const workspaces = await workspaceModel.getWorkspacesByUserId(userId)
    return workspaces
  } catch (error) {
    throw error
  }
}

// Lấy workspace detail kèm thông tin user đầy đủ (populated members)
const getDetails = async (workspaceId) => {
  try {
    const workspace = await workspaceModel.getDetailsWithMembers(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }
    return workspace
  } catch (error) {
    throw error
  }
}

const deleteItem = async (userId, workspaceId) => {
  try {
    const targetWorkspace = await workspaceModel.findById(workspaceId)
    if (!targetWorkspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    // Double-check: Chỉ Owner mới được xóa workspace
    const ownerMember = targetWorkspace.members.find(
      m => m.userId && m.userId.toString() === userId.toString() && m.role === WORKSPACE_ROLES.OWNER
    )
    if (!ownerMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only the workspace owner can delete this workspace!')
    }

    const { result, assetCleanup } = await cascadeDeletionService.deleteWorkspace(workspaceId)

    return {
      deleteResult: 'Workspace and all related Boards deleted successfully!',
      deletedBoardCount: result.deletedBoardCount,
      assetCleanupFailures: assetCleanup.filter(item => item.status === 'failed').length
    }
  } catch (error) {
    throw error
  }
}

// Export toàn bộ dữ liệu workspace (boards + columns + cards + members) ra JSON thuần.
// Chỉ ĐỌC, không đổi dữ liệu. Các field nhạy cảm đã được loại bỏ ngay từ tầng model:
//   - getDetailsWithMembers: project bỏ password/verifyToken và KHÔNG đẩy inviteToken ra ngoài.
//   - getDetails (board): project bỏ password/verifyToken của owners/members.
// Ở đây chỉ pick lại đúng các field cần thiết để payload gọn và không rò rỉ thêm gì.
const exportData = async (workspaceId) => {
  try {
    const workspace = await workspaceModel.getDetailsWithMembers(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    // Lấy các board còn sống (findByWorkspaceId đã lọc _destroy: false),
    // sau đó dùng aggregate getDetails có sẵn để kèm columns/cards/labels — tránh N+1 query thủ công.
    const boards = await boardModel.findByWorkspaceId(workspaceId)
    const boardDetails = await Promise.all(
      boards.map((board) => boardModel.getDetails(null, board._id.toString()))
    )

    const exportedBoards = boardDetails
      .filter(Boolean) // phòng thủ: bỏ qua board vừa bị xoá giữa 2 query
      .map((board) => ({
        _id: board._id,
        title: board.title,
        description: board.description,
        type: board.type,
        columnOrderIds: board.columnOrderIds,
        columns: board.columns,
        cards: board.cards,
        labels: board.labels,
        customFields: board.customFields // giữ để card.customFieldValues còn tham chiếu hợp lệ
      }))

    return {
      schemaVersion: 1,
      kind: 'workspace',
      exportedAt: new Date().toISOString(),
      workspace: {
        _id: workspace._id,
        title: workspace.title,
        description: workspace.description,
        visibility: workspace.visibility,
        createdAt: workspace.createdAt,
        // members đã sạch từ getDetailsWithMembers; chỉ giữ lại field public, bỏ notificationPrefs (dữ liệu cá nhân)
        members: (workspace.members || []).map((m) => ({
          userId: m.userId,
          email: m.email,
          displayName: m.displayName,
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt
        }))
      },
      boards: exportedBoards
    }
  } catch (error) {
    throw error
  }
}

// Import: tạo MỘT workspace mới từ file JSON đã export.
// Nguyên tắc nghiệp vụ:
//   - Người bấm import trở thành OWNER duy nhất (không tái tạo được tài khoản người khác).
//   - Sinh ObjectId MỚI cho mọi entity rồi remap toàn bộ tham chiếu chéo, giữ đúng thứ tự cột/thẻ.
//   - KHÔNG mang theo: thành viên khác, assignee (memberIds), attachments, comments → reset rỗng/0.
//   - Ghi atomic qua transaction ở tầng model (all-or-nothing).
// reqBody đã được validation strip sạch, chỉ còn field trong whitelist.
const importData = async (userId, email, reqBody) => {
  try {
    const now = Date.now()
    const ownerObjectId = new ObjectId(userId)
    const workspaceId = new ObjectId()

    const workspaceDoc = {
      _id: workspaceId,
      title: reqBody.workspace.title,
      description: reqBody.workspace.description || '',
      logo: null,
      visibility: reqBody.workspace.visibility || 'private',
      invitePermission: 'admin',
      boardCreation: 'all',
      boardDeletion: 'admin',
      members: [{
        userId: ownerObjectId,
        email,
        role: WORKSPACE_ROLES.OWNER,
        status: 'active',
        inviteToken: null,
        joinedAt: now
      }],
      createdAt: now,
      updatedAt: null,
      _destroy: false
    }

    // Dựng document cho từng board bằng helper dùng chung (remap ID + reset field nhạy cảm).
    const boardDocs = []
    const columnDocs = []
    const cardDocs = []
    const labelDocs = []

    for (const board of (reqBody.boards || [])) {
      const built = buildBoardDocs(board, { ownerObjectId, workspaceId, now })
      boardDocs.push(built.boardDoc)
      columnDocs.push(...built.columnDocs)
      cardDocs.push(...built.cardDocs)
      labelDocs.push(...built.labelDocs)
    }

    const newWorkspaceId = await workspaceModel.importWorkspace({ workspaceDoc, boardDocs, columnDocs, cardDocs, labelDocs })

    return {
      workspaceId: newWorkspaceId,
      counts: {
        boards: boardDocs.length,
        columns: columnDocs.length,
        cards: cardDocs.length,
        labels: labelDocs.length
      }
    }
  } catch (error) {
    throw error
  }
}

const update = async (actorId, workspaceId, reqBody) => {
  try {
    // Chỉ cho phép cập nhật các field an toàn (tránh mass-assignment: _destroy, members, ...)
    const ALLOWED_FIELDS = ['title', 'description', 'visibility', 'invitePermission', 'boardCreation', 'boardDeletion']
    const updateData = { updatedAt: Date.now() }
    for (const field of ALLOWED_FIELDS) {
      if (reqBody[field] !== undefined) updateData[field] = reqBody[field]
    }

    // Lấy bản ghi trước khi cập nhật để so sánh, chỉ ghi activity cho field thực sự đổi giá trị
    const before = await workspaceModel.findById(workspaceId)
    const updatedWorkspace = await workspaceModel.update(workspaceId, updateData)

    // Ghi Activity Log (best-effort) cho các thay đổi "macro" ở Settings.
    // Rename (title) tách riêng để FE render "renamed workspace to X"; các field còn lại là "changed X to Y".
    // Bỏ qua description (thay đổi vặt, gây nhiễu log).
    if (before) {
      if (updateData.title !== undefined && updateData.title !== before.title) {
        workspaceActivityService.log({
          workspaceId, actorId, actionType: WORKSPACE_ACTIVITY_TYPES.SETTINGS_CHANGED,
          targetName: updateData.title, metadata: { settingKey: 'title', settingValue: updateData.title }
        })
      }
      for (const key of ['visibility', 'invitePermission', 'boardCreation', 'boardDeletion']) {
        if (updateData[key] !== undefined && updateData[key] !== before[key]) {
          workspaceActivityService.log({
            workspaceId, actorId, actionType: WORKSPACE_ACTIVITY_TYPES.SETTINGS_CHANGED,
            metadata: { settingKey: key, settingValue: updateData[key] }
          })
        }
      }
    }

    return updatedWorkspace
  } catch (error) {
    throw error
  }
}

/**
 * Chuyển quyền sở hữu workspace cho một member khác
 *
 * EDGE CASES:
 * 1. Không thể transfer cho chính mình
 * 2. Chỉ owner hiện tại mới được transfer
 * 3. Target phải là member active của workspace
 */
const transferOwnership = async (actorUserId, workspaceId, newOwnerUserId) => {
  try {
    if (actorUserId.toString() === newOwnerUserId.toString()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You are already the owner of this workspace.')
    }

    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    // Actor phải là owner hiện tại
    const actorMember = workspace.members.find(m => m.userId && m.userId.toString() === actorUserId.toString())
    if (!actorMember || actorMember.role !== WORKSPACE_ROLES.OWNER) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only the workspace owner can transfer ownership.')
    }

    // Target phải là member active (không phải pending, không phải chính actor)
    const targetMember = workspace.members.find(m => m.userId && m.userId.toString() === newOwnerUserId.toString())
    if (!targetMember) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'The selected user is not a member of this workspace!')
    }
    if (targetMember.status !== 'active') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You can only transfer ownership to an active member.')
    }

    const updatedWorkspace = await workspaceModel.transferOwnership(workspaceId, actorUserId, newOwnerUserId)

    // Ghi Activity Log (best-effort): owner cũ đã chuyển quyền sở hữu cho ai
    const newOwnerName = await resolveMemberName(targetMember.userId, targetMember.email)
    workspaceActivityService.log({
      workspaceId, actorId: actorUserId, actionType: WORKSPACE_ACTIVITY_TYPES.OWNERSHIP_TRANSFERRED,
      targetName: newOwnerName
    })

    return updatedWorkspace
  } catch (error) {
    throw error
  }
}

/**
 * Cập nhật tuỳ chọn thông báo cá nhân của user trong 1 workspace.
 * Ai cũng chỉnh được prefs CỦA CHÍNH MÌNH (không phải quyền admin).
 */
const updateNotificationPrefs = async (userId, workspaceId, prefs) => {
  try {
    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    const member = workspace.members.find(m => m.userId && m.userId.toString() === userId.toString())
    if (!member) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'You are not a member of this workspace!')
    }

    // Gộp: mặc định -> prefs đang lưu -> prefs mới gửi lên (đảm bảo object luôn đủ 5 key)
    const mergedPrefs = {
      ...workspaceModel.DEFAULT_NOTIFICATION_PREFS,
      ...(member.notificationPrefs || {}),
      ...prefs
    }

    const updatedWorkspace = await workspaceModel.updateMemberNotificationPrefs(workspaceId, userId, mergedPrefs)
    return updatedWorkspace
  } catch (error) {
    throw error
  }
}

/**
 * Upload / cập nhật logo workspace (Cloudinary)
 */
const updateLogo = async (actorId, workspaceId, logoFile) => {
  try {
    if (!logoFile) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No logo file provided!')
    }
    const uploadResult = await cloudinaryProvider.streamUpload(logoFile.buffer, 'workspaces')
    const updatedWorkspace = await workspaceModel.update(workspaceId, {
      logo: uploadResult.secure_url,
      updatedAt: Date.now()
    })

    // Ghi Activity Log (best-effort): đổi logo workspace
    workspaceActivityService.log({
      workspaceId, actorId, actionType: WORKSPACE_ACTIVITY_TYPES.SETTINGS_CHANGED,
      metadata: { settingKey: 'logo' }
    })

    return updatedWorkspace
  } catch (error) {
    throw error
  }
}

/**
 * Mời member mới vào workspace qua email (Pending status)
 */
const inviteMember = async (inviterId, workspaceId, reqBody) => {
  try {
    const { inviteeEmail, role } = reqBody

    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    // Enforce invitePermission setting:
    // 'admin' (default) → chỉ Owner + Admin invite được
    // 'all' → tất cả member đều invite được
    if (workspace.invitePermission !== 'all') {
      const actor = workspace.members.find(m => m.userId?.toString() === inviterId.toString() && m.status === 'active')
      if (actor?.role === WORKSPACE_ROLES.MEMBER) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Only Owner and Admin can invite members in this workspace.')
      }
    }

    // 1. Check xem user đã ở trong Workspace chưa?
    const existingMember = workspace.members.find(m => m.email === inviteeEmail)
    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new ApiError(StatusCodes.CONFLICT, 'This user is already an active member of this workspace!')
      }
      if (existingMember.status === 'pending') {
        const isExpired = existingMember.inviteExpiresAt &&
          new Date(existingMember.inviteExpiresAt).getTime() <= Date.now()
        if (!isExpired) {
          throw new ApiError(StatusCodes.CONFLICT, 'An invitation has already been sent to this email!')
        }
        await workspaceModel.removeMember(workspaceId, inviteeEmail)
      }
    }

    // 2. Tạo Token độc nhất
    const inviteToken = crypto.randomBytes(32).toString('hex')

    // 3. Chuẩn bị pending member data
    const memberRole = role || WORKSPACE_ROLES.MEMBER
    
    // Lấy user object nếu user đã có tài khoản (để có thể gắn userId ngay nếu muốn, nhưng ở đây theo AI suggest, có thể set null)
    // Nhưng tối ưu hơn: nếu có user, gắn userId luôn, chỉ để status pending.
    const existingUser = await userModel.findOneByEmail(inviteeEmail)
    const newPendingUserId = existingUser ? existingUser._id : null
    
    const db = GET_DB()
    const newPendingMember = {
      userId: newPendingUserId,
      email: inviteeEmail,
      role: memberRole,
      status: 'pending',
      inviteToken: inviteToken,
      inviteExpiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      joinedAt: Date.now()
    }

    // 4. Nhét vào database
    await db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME).updateOne(
      { _id: new ObjectId(workspaceId) },
      { $push: { members: newPendingMember } }
    )

    // 5. BẮN EMAIL BẰNG BREVO
    const websiteDomain = env.BUILD_MODE === 'dev' ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION
    const inviteLink = `${websiteDomain}/accept-invite?token=${inviteToken}&workspaceId=${workspaceId}`
    const subject = `You are invited to join the Workspace: ${workspace.title}`
    const htmlContent = `
      <h3>Hello,</h3>
      <p>You have been invited to join the workspace <strong>${workspace.title}</strong> on Whip.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${inviteLink}" style="display:inline-block;padding:10px 20px;background-color:#238636;color:#fff;text-decoration:none;border-radius:4px;">Accept Invitation</a>
      <p>If you don't have an account, you will need to create one first.</p>
    `
    
    try {
      await brevoProvider.sendEmail(inviteeEmail, subject, htmlContent)
    } catch (error) {
      console.error('Lỗi khi gửi email mời qua Brevo:', error)
      // Optional: rollback if email fails, but usually we just warn.
    }

    // Ghi Activity Log (best-effort): ai đã mời email nào
    workspaceActivityService.log({
      workspaceId, actorId: inviterId, actionType: WORKSPACE_ACTIVITY_TYPES.MEMBER_INVITED,
      targetName: inviteeEmail, metadata: { role: memberRole }
    })

    return { message: 'Invitation sent successfully!', newMember: newPendingMember }
  } catch (error) {
    throw error
  }
}

/**
 * Accept invite
 */
const acceptInvite = async (userId, userEmail, token, workspaceId) => {
  try {
    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')

    const pendingMember = workspace.members.find(m => m.inviteToken === token)
    if (!pendingMember) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid or expired invitation token!')
    }
    if (
      pendingMember.inviteExpiresAt &&
      new Date(pendingMember.inviteExpiresAt).getTime() <= Date.now()
    ) {
      await workspaceModel.removeMember(workspaceId, pendingMember.email)
      throw new ApiError(StatusCodes.GONE, 'This workspace invitation has expired!')
    }

    // Đảm bảo đúng người nhận email mới được accept
    if (pendingMember.email !== userEmail) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'This invitation is not for your email address!')
    }

    // Accept (cập nhật status active, xóa token, gán userId)
    await workspaceModel.acceptInviteMember(workspaceId, token, userId)

    // Báo cho các thành viên hiện có: có người mới tham gia (email, best-effort — không chặn)
    const existingActiveMemberIds = workspace.members
      .filter(m => m.userId && m.status === 'active')
      .map(m => m.userId.toString())
    notificationService.dispatch({
      type: NOTIFICATION_TYPES.MEMBER_JOINED,
      workspaceId,
      recipientIds: existingActiveMemberIds,
      actorId: userId,
      context: { workspaceTitle: workspace.title }
    })

    // Ghi Activity Log (best-effort): thành viên mới đã tham gia workspace
    workspaceActivityService.log({
      workspaceId, actorId: userId, actionType: WORKSPACE_ACTIVITY_TYPES.MEMBER_JOINED
    })

    return { message: 'Invitation accepted successfully!', workspaceId }
  } catch (error) {
    throw error
  }
}

/**
 * Kick/Remove member khỏi workspace
 * 
 * EDGE CASES (Bức tường thép):
 * 1. Admin không được kick Owner → 403
 * 2. Không được tự kick chính mình → 400 (dùng leaveWorkspace thay thế)
 * 3. Admin không được kick Admin khác (chỉ Owner mới kick Admin)
 * 4. CASCADE: Khi kick, gỡ user khỏi tất cả boards trong workspace
 */
const removeMember = async (actorUserId, workspaceId, targetUserId) => {
  try {
    // Ngăn tự kick chính mình
    if (actorUserId.toString() === targetUserId.toString()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot kick yourself. Use Leave Workspace instead.')
    }

    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    // Tìm role của actor (người bấm kick)
    const actorMember = workspace.members.find(m => m.userId && m.userId.toString() === actorUserId.toString())
    const actorRole = actorMember?.role

    // Tìm role của target (người bị kick), vì có thể pending nên xóa bằng userId hoặc email
    const targetMember = workspace.members.find(m => 
      (m.userId && m.userId.toString() === targetUserId.toString()) || 
      (m.email === targetUserId)
    )
    if (!targetMember) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Target user is not a member of this workspace!')
    }
    const targetRole = targetMember.role

    // BỨC TƯỜNG THÉP NGHIỆP VỤ
    if (targetRole === WORKSPACE_ROLES.OWNER) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot remove the workspace owner!')
    }

    // Admin chỉ kick được Member, không kick được Admin khác
    if (actorRole === WORKSPACE_ROLES.ADMIN && targetRole === WORKSPACE_ROLES.ADMIN) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Admins cannot remove other admins. Only the owner can do this.')
    }

    const workspaceOwner = workspace.members.find(m => m.role === WORKSPACE_ROLES.OWNER)
    if (!workspaceOwner?.userId) {
      throw new ApiError(StatusCodes.CONFLICT, 'Workspace owner information is invalid!')
    }

    // Membership and direct board access are revoked in one transaction.
    const updatedWorkspace = await removeMemberAndRevokeBoardAccess({
      workspaceId,
      memberIdentifier: targetUserId,
      memberUserId: targetMember.userId?.toString(),
      workspaceOwnerId: workspaceOwner.userId.toString()
    })

    // Ghi Activity Log (best-effort): actor đã kick member nào ra khỏi workspace
    const removedName = await resolveMemberName(targetMember.userId, targetMember.email)
    workspaceActivityService.log({
      workspaceId, actorId: actorUserId, actionType: WORKSPACE_ACTIVITY_TYPES.MEMBER_REMOVED,
      targetName: removedName
    })

    return updatedWorkspace
  } catch (error) {
    throw error
  }
}

/**
 * Cập nhật role của member trong workspace
 * 
 * EDGE CASES:
 * 1. Không ai được thay đổi role của Owner
 * 2. Admin không được nâng người khác lên Owner
 * 3. Không được tự đổi role chính mình
 * 4. Admin không được đổi role Admin khác (chỉ Owner mới được)
 */
const updateMemberRole = async (actorUserId, workspaceId, targetUserId, newRole) => {
  try {
    // Không được tự đổi role chính mình
    if (actorUserId.toString() === targetUserId.toString()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot change your own role.')
    }

    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    const actorMember = workspace.members.find(m => m.userId && m.userId.toString() === actorUserId.toString())
    const actorRole = actorMember?.role

    const targetMember = workspace.members.find(m => 
      (m.userId && m.userId.toString() === targetUserId.toString()) || 
      (m.email === targetUserId)
    )
    if (!targetMember) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Target user is not a member of this workspace!')
    }
    const targetRole = targetMember.role

    // Không ai được thay đổi role của Owner
    if (targetRole === WORKSPACE_ROLES.OWNER) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot change the role of the workspace owner!')
    }

    // Admin không được đổi role Admin khác
    if (actorRole === WORKSPACE_ROLES.ADMIN && targetRole === WORKSPACE_ROLES.ADMIN) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Admins cannot change roles of other admins.')
    }

    const updatedWorkspace = await workspaceModel.updateMemberRole(workspaceId, targetUserId, newRole)

    // Ghi Activity Log (best-effort): actor đã đổi quyền của member nào thành role gì
    const targetName = await resolveMemberName(targetMember.userId, targetMember.email)
    workspaceActivityService.log({
      workspaceId, actorId: actorUserId, actionType: WORKSPACE_ACTIVITY_TYPES.MEMBER_ROLE_CHANGED,
      targetName, metadata: { newRole }
    })

    return updatedWorkspace
  } catch (error) {
    throw error
  }
}

/**
 * Tự rời khỏi workspace
 * 
 * EDGE CASES:
 * 1. Owner KHÔNG ĐƯỢC leave (phải transfer ownership trước — hiện chưa hỗ trợ)
 * 2. CASCADE: Khi leave, gỡ user khỏi tất cả boards trong workspace
 */
const leaveWorkspace = async (userId, workspaceId) => {
  try {
    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    const memberInfo = workspace.members.find(m => m.userId && m.userId.toString() === userId.toString())
    if (!memberInfo) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'You are not a member of this workspace!')
    }

    // Owner không được leave
    if (memberInfo.role === WORKSPACE_ROLES.OWNER) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The workspace owner cannot leave. Transfer ownership first or delete the workspace.'
      )
    }

    const workspaceOwner = workspace.members.find(m => m.role === WORKSPACE_ROLES.OWNER)
    if (!workspaceOwner?.userId) {
      throw new ApiError(StatusCodes.CONFLICT, 'Workspace owner information is invalid!')
    }

    // Membership and direct board access are revoked in one transaction.
    const updatedWorkspace = await removeMemberAndRevokeBoardAccess({
      workspaceId,
      memberIdentifier: userId,
      memberUserId: userId,
      workspaceOwnerId: workspaceOwner.userId.toString()
    })

    // Ghi Activity Log (best-effort): thành viên tự rời workspace
    workspaceActivityService.log({
      workspaceId, actorId: userId, actionType: WORKSPACE_ACTIVITY_TYPES.MEMBER_LEFT
    })

    return updatedWorkspace
  } catch (error) {
    throw error
  }
}

/**
 * Lấy danh sách members với thông tin user đầy đủ (email, displayName, avatar)
 */
const getMembers = async (workspaceId) => {
  try {
    const workspace = await workspaceModel.getDetailsWithMembers(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }
    return workspace.members || []
  } catch (error) {
    throw error
  }
}

/**
 * Atomically remove a workspace membership and all direct board access.
 * If the departing member owns boards, the workspace owner becomes their owner.
 */
const removeMemberAndRevokeBoardAccess = async ({
  workspaceId,
  memberIdentifier,
  memberUserId,
  workspaceOwnerId
}) => {
  const client = GET_CLIENT()
  const session = client.startSession()
  let updatedWorkspace = null

  try {
    const db = GET_DB()
    const workspaceObjectId = new ObjectId(workspaceId)
    const memberPullCondition = memberIdentifier.includes('@')
      ? { email: memberIdentifier }
      : { userId: new ObjectId(memberIdentifier) }

    await session.withTransaction(async () => {
      updatedWorkspace = await db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
        { _id: workspaceObjectId, members: { $elemMatch: memberPullCondition } },
        {
          $pull: { members: memberPullCondition },
          $set: { updatedAt: Date.now() }
        },
        { returnDocument: 'after', session }
      )

      if (!updatedWorkspace) {
        throw new ApiError(StatusCodes.CONFLICT, 'Workspace membership changed. Please retry.')
      }

      if (!memberUserId) return

      const userObjectId = new ObjectId(memberUserId)
      const ownerObjectId = new ObjectId(workspaceOwnerId)
      const boardCollection = db.collection(boardModel.BOARD_COLLECTION_NAME)

      // A pipeline avoids conflicting update operators on ownerIds.
      await boardCollection.updateMany(
        { workspaceId: workspaceObjectId, ownerIds: userObjectId },
        [{
          $set: {
            ownerIds: {
              $setUnion: [
                {
                  $filter: {
                    input: { $ifNull: ['$ownerIds', []] },
                    as: 'ownerId',
                    cond: { $ne: ['$$ownerId', userObjectId] }
                  }
                },
                [ownerObjectId]
              ]
            },
            memberIds: {
              $setUnion: [
                {
                  $filter: {
                    input: { $ifNull: ['$memberIds', []] },
                    as: 'memberId',
                    cond: { $ne: ['$$memberId', userObjectId] }
                  }
                },
                [ownerObjectId]
              ]
            }
          }
        }],
        { session }
      )

      await boardCollection.updateMany(
        { workspaceId: workspaceObjectId },
        {
          $pull: {
            memberIds: userObjectId,
            ownerIds: userObjectId,
            starredBy: userObjectId
          }
        },
        { session }
      )
    })

    return updatedWorkspace
  } finally {
    await session.endSession()
  }
}

const INVITATION_TTL_MS = INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000

export const workspaceService = {
  createNew,
  getWorkspacesByUserId,
  getDetails,
  deleteItem,
  exportData,
  importData,
  update,
  inviteMember,
  acceptInvite,
  removeMember,
  updateMemberRole,
  leaveWorkspace,
  getMembers,
  transferOwnership,
  updateLogo,
  updateNotificationPrefs
}
