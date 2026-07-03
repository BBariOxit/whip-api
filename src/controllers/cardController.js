import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'


const createNew = async (req, res, next) => {
  try {
    const createCard = await cardService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createCard)
  } catch (error) {
    next(error)
  }
}

const duplicateCard = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { cardId, targetColumnId } = req.body
    const newCard = await cardService.duplicateCard(cardId, targetColumnId, userId)

    res.status(StatusCodes.CREATED).json(newCard)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const userInfo = req.jwtDecoded
    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

const uploadAttachment = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const attachmentFile = req.file
    const userInfo = req.jwtDecoded
    const updatedCard = await cardService.uploadAttachment(cardId, attachmentFile, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

const deleteAttachment = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const { publicId } = req.body
    const userInfo = req.jwtDecoded
    const updatedCard = await cardService.deleteAttachment(cardId, publicId, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const userInfo = req.jwtDecoded
    const result = await cardService.deleteItem(cardId, userInfo)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const archiveCard = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const userInfo = req.jwtDecoded
    const result = await cardService.archiveCard(cardId, userInfo)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const restoreCard = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const { newColumnId } = req.body
    const result = await cardService.restoreCard(cardId, newColumnId)

    res.status(StatusCodes.OK).json({ message: 'Card restored successfully!', card: result })
  } catch (error) { next(error) }
}

// ===== TEMPLATE CONTROLLERS =====
const saveAsTemplate = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const template = await cardService.saveAsTemplate(cardId)

    res.status(StatusCodes.CREATED).json(template)
  } catch (error) { next(error) }
}

const useTemplate = async (req, res, next) => {
  try {
    const { templateId, targetColumnId } = req.body
    const newCard = await cardService.useTemplate(templateId, targetColumnId)

    res.status(StatusCodes.CREATED).json(newCard)
  } catch (error) { next(error) }
}

const deleteTemplate = async (req, res, next) => {
  try {
    const templateId = req.params.id
    const result = await cardService.deleteTemplate(templateId)

    res.status(StatusCodes.OK).json({ message: 'Template deleted successfully!', result })
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update,
  uploadAttachment,
  deleteAttachment,
  deleteItem,
  archiveCard,
  restoreCard,
  saveAsTemplate,
  useTemplate,
  deleteTemplate,
  duplicateCard
}