import { StatusCodes } from 'http-status-codes'
import { workspaceService } from '~/services/workspaceService'
import { workspaceActivityService } from '~/services/workspaceActivityService'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const email = req.jwtDecoded.email
    const createdWorkspace = await workspaceService.createNew(userId, email, req.body)
    res.status(StatusCodes.CREATED).json(createdWorkspace)
  } catch (error) {
    next(error)
  }
}

const getWorkspacesByUserId = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const workspaces = await workspaceService.getWorkspacesByUserId(userId)
    res.status(StatusCodes.OK).json(workspaces)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const workspaceId = req.params.id
    const workspace = await workspaceService.getDetails(workspaceId)
    res.status(StatusCodes.OK).json(workspace)
  } catch (error) {
    next(error)
  }
}

const deleteItem = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const result = await workspaceService.deleteItem(userId, workspaceId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const exportData = async (req, res, next) => {
  try {
    const workspaceId = req.params.id
    const data = await workspaceService.exportData(workspaceId)

    // Tên file an toàn: chỉ dùng id + ngày, tránh chèn ký tự lạ từ title người dùng vào header.
    const filename = `whip-workspace-${workspaceId}-${new Date().toISOString().slice(0, 10)}.json`
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(StatusCodes.OK).send(JSON.stringify(data, null, 2))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const actorId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const updatedWorkspace = await workspaceService.update(actorId, workspaceId, req.body)
    res.status(StatusCodes.OK).json(updatedWorkspace)
  } catch (error) {
    next(error)
  }
}

const inviteMember = async (req, res, next) => {
  try {
    const inviterId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const result = await workspaceService.inviteMember(inviterId, workspaceId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const acceptInvite = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const userEmail = req.jwtDecoded.email
    const { token, workspaceId } = req.body
    
    if (!token || !workspaceId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Token and workspaceId are required!')
    }

    const result = await workspaceService.acceptInvite(userId, userEmail, token, workspaceId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const removeMember = async (req, res, next) => {
  try {
    const actorUserId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const targetUserId = req.params.targetUserId
    const result = await workspaceService.removeMember(actorUserId, workspaceId, targetUserId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateMemberRole = async (req, res, next) => {
  try {
    const actorUserId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const targetUserId = req.params.targetUserId
    const { role } = req.body
    const result = await workspaceService.updateMemberRole(actorUserId, workspaceId, targetUserId, role)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const leaveWorkspace = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const result = await workspaceService.leaveWorkspace(userId, workspaceId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getMembers = async (req, res, next) => {
  try {
    const workspaceId = req.params.id
    const members = await workspaceService.getMembers(workspaceId)
    res.status(StatusCodes.OK).json(members)
  } catch (error) {
    next(error)
  }
}

const transferOwnership = async (req, res, next) => {
  try {
    const actorUserId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const { targetUserId } = req.body
    const result = await workspaceService.transferOwnership(actorUserId, workspaceId, targetUserId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateLogo = async (req, res, next) => {
  try {
    const actorId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const logoFile = req.file
    const result = await workspaceService.updateLogo(actorId, workspaceId, logoFile)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateNotificationPrefs = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const workspaceId = req.params.id
    const result = await workspaceService.updateNotificationPrefs(userId, workspaceId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

// Đọc Activity Log của workspace (mọi member active đều xem được — RBAC ở tầng route)
const getActivities = async (req, res, next) => {
  try {
    const workspaceId = req.params.id
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = parseInt(req.query.limit) || 10
    const result = await workspaceActivityService.getActivities(workspaceId, page, limit)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const workspaceController = {
  createNew,
  getWorkspacesByUserId,
  getDetails,
  deleteItem,
  exportData,
  update,
  inviteMember,
  acceptInvite,
  removeMember,
  updateMemberRole,
  leaveWorkspace,
  getMembers,
  transferOwnership,
  updateLogo,
  updateNotificationPrefs,
  getActivities
}
