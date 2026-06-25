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

const saveAsTemplate = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const result = await columnService.saveAsTemplate(columnId)
    res.status(StatusCodes.OK).json({ message: 'Column saved as template successfully!', template: result })
  } catch (error) {
    next(error)
  }
}

const useColumnTemplate = async (req, res, next) => {
  try {
    const { templateId, boardId } = req.body
    if (!templateId || !boardId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing templateId or boardId' })
    }
    const result = await columnService.useColumnTemplate(templateId, boardId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteColumnTemplate = async (req, res, next) => {
  try {
    const templateId = req.params.id
    const result = await columnService.deleteColumnTemplate(templateId)
    res.status(StatusCodes.OK).json({ message: 'Template deleted successfully!', result })
  } catch (error) {
    next(error)
  }
}

const duplicateColumn = async (req, res, next) => {
  try {
    const newColumnWithCards = await columnService.duplicateColumn(req.body)
    res.status(StatusCodes.OK).json(newColumnWithCards)
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
  restoreColumn,
  saveAsTemplate,
  useColumnTemplate,
  deleteColumnTemplate,
  duplicateColumn
}