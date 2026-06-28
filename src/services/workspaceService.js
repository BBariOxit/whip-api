import { workspaceModel } from '~/models/workspaceModel'

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

export const workspaceService = {
  createNew,
  getWorkspacesByUserId
}
