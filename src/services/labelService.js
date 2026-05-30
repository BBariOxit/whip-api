import { labelModel } from '~/models/labelModel'
import { cardModel } from '~/models/cardModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (reqBody) => {
  try {
    const newLabel = {
      ...reqBody
    }
    const createdLabel = await labelModel.createNew(newLabel)
    const getNewLabel = await labelModel.findOneById(createdLabel.insertedId)

    return getNewLabel
  } catch (error) {
    throw error
  }
}

const update = async (labelId, updateData) => {
  try {
    const updatedLabel = await labelModel.update(labelId, updateData)
    return updatedLabel
  } catch (error) {
    throw error
  }
}

const deleteItem = async (labelId) => {
  try {
    const label = await labelModel.findOneById(labelId)
    if (!label) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found!')
    }
    // Delete label from labels collection
    await labelModel.deleteOneById(labelId)
    // Delete labelId from all cards in the board
    await cardModel.pullLabelFromCards(label.boardId, labelId)
    
    return { deleteResult: 'Label and its references deleted successfully!' }
  } catch (error) {
    throw error
  }
}

export const labelService = {
  createNew,
  update,
  deleteItem
}
