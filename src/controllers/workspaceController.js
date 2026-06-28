import { StatusCodes } from 'http-status-codes'
import { workspaceService } from '~/services/workspaceService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createdWorkspace = await workspaceService.createNew(userId, req.body)
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

const update = async (req, res, next) => {
  try {
    const workspaceId = req.params.id
    const updatedWorkspace = await workspaceService.update(workspaceId, req.body)
    res.status(StatusCodes.OK).json(updatedWorkspace)
  } catch (error) {
    next(error)
  }
}

export const workspaceController = {
  createNew,
  getWorkspacesByUserId,
  deleteItem,
  update
}
