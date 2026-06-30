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

const createNew = async (userId, reqBody) => {
  try {
    const createdWorkspace = await workspaceModel.createNew(userId, reqBody)
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

    // Double-check: Chỉ Owner mới được xóa workspace (middleware đã chặn nhưng service nên verify lại)
    const ownerMember = targetWorkspace.members.find(
      m => m.userId.toString() === userId.toString() && m.role === WORKSPACE_ROLES.OWNER
    )
    if (!ownerMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only the workspace owner can delete this workspace!')
    }

    // Lấy tất cả boards thuộc workspace này
    const boards = await boardModel.findByWorkspaceId(workspaceId)
    
    // Loop through each board and delete it (cascade: xóa columns + cards)
    for (const board of boards) {
      await boardService.deleteItem(board._id.toString())
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
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedWorkspace = await workspaceModel.update(workspaceId, updateData)
    return updatedWorkspace
  } catch (error) {
    throw error
  }
}

/**
 * Mời member mới vào workspace
 * - Tìm user theo email
 * - Kiểm tra user đã là member chưa
 * - Thêm user vào members array
 * - Tạo workspace invitation record
 */
const inviteMember = async (inviterId, workspaceId, reqBody) => {
  try {
    const { inviteeEmail, role } = reqBody

    // Tìm user được mời
    const invitee = await userModel.findOneByEmail(inviteeEmail)
    if (!invitee) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User with this email not found!')
    }

    // Kiểm tra user đã là member chưa
    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }

    const alreadyMember = workspace.members.find(
      m => m.userId.toString() === invitee._id.toString()
    )
    if (alreadyMember) {
      throw new ApiError(StatusCodes.CONFLICT, 'This user is already a member of this workspace!')
    }

    // Thêm member vào workspace
    const memberRole = role || WORKSPACE_ROLES.MEMBER
    const updatedWorkspace = await workspaceModel.addMember(workspaceId, invitee._id.toString(), memberRole)

    // Tạo workspace invitation record (để lưu lịch sử mời)
    try {
      const invitationData = {
        inviterId: inviterId,
        inviteeId: invitee._id.toString(),
        type: INVITATION_TYPES.WORKSPACE_INVITATION,
        workspaceInvitation: {
          workspaceId: workspaceId,
          status: BOARD_INVITATION_STATUS.ACCEPTED // Accepted ngay vì được thêm trực tiếp
        }
      }
      await invitationModel.createNewWorkspaceInvitation(invitationData)
    } catch (invError) {
      // Không throw nếu invitation lưu lỗi — member đã được thêm thành công
      console.error('Warning: Failed to create invitation record:', invError.message)
    }

    return updatedWorkspace
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
    const actorMember = workspace.members.find(m => m.userId.toString() === actorUserId.toString())
    const actorRole = actorMember?.role

    // Tìm role của target (người bị kick)
    const targetMember = workspace.members.find(m => m.userId.toString() === targetUserId.toString())
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

    // Xóa member khỏi workspace
    const updatedWorkspace = await workspaceModel.removeMember(workspaceId, targetUserId)

    // CASCADE: Gỡ user khỏi tất cả boards trong workspace
    await cascadeRemoveUserFromBoards(workspaceId, targetUserId)

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

    const actorMember = workspace.members.find(m => m.userId.toString() === actorUserId.toString())
    const actorRole = actorMember?.role

    const targetMember = workspace.members.find(m => m.userId.toString() === targetUserId.toString())
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

    const memberInfo = workspace.members.find(m => m.userId.toString() === userId.toString())
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

    // CASCADE: Gỡ user khỏi tất cả boards trong workspace
    await cascadeRemoveUserFromBoards(workspaceId, userId)

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
const cascadeRemoveUserFromBoards = async (workspaceId, userId) => {
  try {
    const db = GET_DB()
    const userObjectId = new ObjectId(userId)

    // Tìm tất cả boards thuộc workspace này
    const boards = await boardModel.findByWorkspaceId(workspaceId)

    for (const board of boards) {
      // Gỡ user khỏi ownerIds
      await db.collection(boardModel.BOARD_COLLECTION_NAME).updateOne(
        { _id: board._id },
        { $pull: { ownerIds: userObjectId } }
      )
      // Gỡ user khỏi memberIds
      await db.collection(boardModel.BOARD_COLLECTION_NAME).updateOne(
        { _id: board._id },
        { $pull: { memberIds: userObjectId } }
      )
    }
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
  removeMember,
  updateMemberRole,
  leaveWorkspace,
  getMembers
}
