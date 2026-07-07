import { workspaceModel } from '~/models/workspaceModel'
import { boardModel } from '~/models/boardModel'
import { boardService } from './boardService'
import { userModel } from '~/models/userModel'
import { invitationModel } from '~/models/invitationModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { WORKSPACE_ROLES, INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

import crypto from 'crypto'
import { env } from '~/config/environment'
import { brevoProvider } from '~/providers/brevoProvider'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'
import { notificationService } from './notificationService'
import { NOTIFICATION_TYPES } from '~/utils/constants'

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

    // Lấy tất cả boards thuộc workspace này
    const boards = await boardModel.findByWorkspaceId(workspaceId)
    
    // Loop through each board and delete it (cascade: xóa columns + cards)
    // Owner xoá workspace → luôn là 'admin' đối với mọi board
    for (const board of boards) {
      await boardService.deleteItem(board._id.toString(), 'admin')
    }

    // Cuối cùng xoá workspace
    await workspaceModel.deleteOneById(workspaceId)

    return { deleteResult: 'Workspace and all related Boards deleted successfully!' }
  } catch (error) {
    throw error
  }
}

const update = async (workspaceId, reqBody) => {
  try {
    // Chỉ cho phép cập nhật các field an toàn (tránh mass-assignment: _destroy, members, ...)
    const ALLOWED_FIELDS = ['title', 'description', 'visibility', 'invitePermission', 'boardCreation', 'boardDeletion']
    const updateData = { updatedAt: Date.now() }
    for (const field of ALLOWED_FIELDS) {
      if (reqBody[field] !== undefined) updateData[field] = reqBody[field]
    }
    const updatedWorkspace = await workspaceModel.update(workspaceId, updateData)
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
const updateLogo = async (workspaceId, logoFile) => {
  try {
    if (!logoFile) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No logo file provided!')
    }
    const uploadResult = await cloudinaryProvider.streamUpload(logoFile.buffer, 'workspaces')
    const updatedWorkspace = await workspaceModel.update(workspaceId, {
      logo: uploadResult.secure_url,
      updatedAt: Date.now()
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
        throw new ApiError(StatusCodes.CONFLICT, 'An invitation has already been sent to this email!')
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

    // Xóa member khỏi workspace (dùng targetUserId, nếu truyền email thì xoá bằng email)
    const updatedWorkspace = await workspaceModel.removeMember(workspaceId, targetUserId)

    const workspaceOwner = workspace.members.find(m => m.role === WORKSPACE_ROLES.OWNER)

    // CASCADE: Gỡ user khỏi tất cả boards trong workspace (Chỉ cần làm nếu user đã có tài khoản thực sự)
    if (targetMember.userId && workspaceOwner && workspaceOwner.userId) {
      await cascadeRemoveUserFromBoards(workspaceId, targetMember.userId.toString(), workspaceOwner.userId.toString())
    }

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

    // Xóa member khỏi workspace
    const updatedWorkspace = await workspaceModel.removeMember(workspaceId, userId)

    const workspaceOwner = workspace.members.find(m => m.role === WORKSPACE_ROLES.OWNER)

    // CASCADE: Gỡ user khỏi tất cả boards trong workspace
    if (workspaceOwner && workspaceOwner.userId) {
      await cascadeRemoveUserFromBoards(workspaceId, userId, workspaceOwner.userId.toString())
    }

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
 * CASCADE: Gỡ user khỏi tất cả boards thuộc workspace
 * Được gọi khi kick member hoặc member leave workspace
 */
const cascadeRemoveUserFromBoards = async (workspaceId, userId, workspaceOwnerId) => {
  try {
    const db = GET_DB()
    const userObjectId = new ObjectId(userId)
    const ownerObjectId = new ObjectId(workspaceOwnerId)
    const boardCollection = db.collection(boardModel.BOARD_COLLECTION_NAME)

    // 1. Đối với các board mà user bị xóa/rời đi ĐANG LÀ OWNER:
    // Gỡ user khỏi ownerIds và NHÉT workspaceOwner vào làm owner thay thế
    const ownedBoards = await boardCollection.find({ 
      workspaceId: new ObjectId(workspaceId),
      ownerIds: userObjectId 
    }).toArray()

    for (const board of ownedBoards) {
      await boardCollection.updateOne(
        { _id: board._id },
        { 
          $pull: { ownerIds: userObjectId },
          $addToSet: { ownerIds: ownerObjectId, memberIds: ownerObjectId }
        }
      )
    }

    // 2. Gỡ user khỏi memberIds VÀ ownerIds trên TOÀN BỘ boards thuộc workspace này
    // (Làm thêm bước ownerIds để chắc chắn không sót)
    await boardCollection.updateMany(
      { workspaceId: new ObjectId(workspaceId) },
      { 
        $pull: { 
          memberIds: userObjectId,
          ownerIds: userObjectId 
        } 
      }
    )
  } catch (error) {
    console.error('Error in cascadeRemoveUserFromBoards:', error.message)
    // Không throw — cascade failure không nên block main operation
  }
}

export const workspaceService = {
  createNew,
  getWorkspacesByUserId,
  getDetails,
  deleteItem,
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
