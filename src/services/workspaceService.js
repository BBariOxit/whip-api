import { workspaceModel } from '~/models/workspaceModel'
import { boardModel } from '~/models/boardModel'
import { boardService } from './boardService'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (userId, reqBody) => {
  try {
    const newWorkspaceData = {
      ...reqBody,
      ownerId: userId
    }
    const createdWorkspace = await workspaceModel.createNew(newWorkspaceData)
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

const deleteItem = async (userId, workspaceId) => {
  try {
    const targetWorkspace = await workspaceModel.findById(workspaceId)
    if (!targetWorkspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')
    }
    // Only owner/members can delete (checking if userId is in memberIds - basic authorization)
    if (!targetWorkspace.memberIds.map(id => id.toString()).includes(userId.toString()) && targetWorkspace.ownerId.toString() !== userId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to delete this workspace!')
    }

    // Lấy tất cả boards thuộc workspace này
    const boards = await boardModel.findByWorkspaceId(workspaceId)
    
    // Loop through each board and delete it (this will recursively delete columns and cards)
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

export const workspaceService = {
  createNew,
  getWorkspacesByUserId,
  deleteItem,
  update
}
