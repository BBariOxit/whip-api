import { StatusCodes } from 'http-status-codes'
import { labelService } from '~/services/labelService'

const createNew = async (req, res, next) => {
  try {
    const createdLabel = await labelService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdLabel)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const labelId = req.params.id
    const updatedLabel = await labelService.update(labelId, req.body)

    res.status(StatusCodes.OK).json(updatedLabel)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const labelId = req.params.id
    const result = await labelService.deleteItem(labelId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const labelController = {
  createNew,
  update,
  deleteItem
}
