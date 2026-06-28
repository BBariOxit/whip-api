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

export const workspaceController = {
  createNew,
  getWorkspacesByUserId
}
