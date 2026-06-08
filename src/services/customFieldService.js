import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { ObjectId } from 'mongodb'

const createNew = async (boardId, reqBody) => {
  try {
    const newFieldId = new ObjectId().toString()
    const newCustomField = {
      _id: newFieldId,
      ...reqBody
    }

    await boardModel.pushCustomField(boardId, newCustomField)

    // Return the newly created field
    return newCustomField
  } catch (error) {
    throw error
  }
}

const update = async (boardId, fieldId, updateData) => {
  try {
    await boardModel.updateCustomField(boardId, fieldId, updateData)

    // We don't need to return the full board, just return success or the updated fields
    return { updateResult: 'Successfully updated custom field!' }
  } catch (error) {
    throw error
  }
}

const deleteItem = async (boardId, fieldId) => {
  try {
    // 1. Remove the custom field definition from the board
    await boardModel.pullCustomField(boardId, fieldId)

    // 2. Remove all values of this custom field from all cards in the board
    await cardModel.pullCustomFieldValues(boardId, fieldId)

    return { deleteResult: 'Custom field and its references deleted successfully!' }
  } catch (error) {
    throw error
  }
}

export const customFieldService = {
  createNew,
  update,
  deleteItem
}
