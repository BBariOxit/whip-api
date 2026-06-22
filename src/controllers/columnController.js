import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
  try {
    const createColumn = await columnService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createColumn)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const updatedColumn = await columnService.update(columnId, req.body)

    res.status(StatusCodes.OK).json(updatedColumn)
  } catch (error) {
    next(error)
  }
}

const deleteItem = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const result = await columnService.deleteItem(columnId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const clearAllCards = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const result = await columnService.clearAllCards(columnId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateAllCardsLayout = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const { newLayout } = req.body

    if (!['compact', 'standard', 'detailed'].includes(newLayout)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid layout code' })
    }

    const result = await columnService.updateAllCardsLayout(columnId, newLayout)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const archiveColumn = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const result = await columnService.archiveColumn(columnId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const restoreColumn = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const result = await columnService.restoreColumn(columnId)

    res.status(StatusCodes.OK).json({ message: 'Column restored successfully!', column: result })
  } catch (error) {
    next(error)
  }
}

export const columnController = {
  createNew,
  update,
  deleteItem,
  clearAllCards,
  updateAllCardsLayout,
  archiveColumn,
  restoreColumn
}