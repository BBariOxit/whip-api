import { StatusCodes } from 'http-status-codes'
import { customFieldService } from '~/services/customFieldService'

const createNew = async (req, res, next) => {
  try {
    const boardId = req.params.boardId
    const createdField = await customFieldService.createNew(boardId, req.body)
    res.status(StatusCodes.CREATED).json(createdField)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.boardId
    const fieldId = req.params.fieldId
    const updatedResult = await customFieldService.update(boardId, fieldId, req.body)

    res.status(StatusCodes.OK).json(updatedResult)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const boardId = req.params.boardId
    const fieldId = req.params.fieldId
    const result = await customFieldService.deleteItem(boardId, fieldId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const customFieldController = {
  createNew,
  update,
  deleteItem
}
