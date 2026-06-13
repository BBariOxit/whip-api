import { StatusCodes } from 'http-status-codes'
import { commentService } from '~/services/commentService'

const createNew = async (req, res, next) => {
  try {
    const createdComment = await commentService.createNew(req.body, req.jwtDecoded)
    res.status(StatusCodes.CREATED).json(createdComment)
  } catch (error) {
    next(error)
  }
}

const getComments = async (req, res, next) => {
  try {
    const { cardId, page, limit } = req.query
    const result = await commentService.getComments(cardId, parseInt(page), parseInt(limit))
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getReplies = async (req, res, next) => {
  try {
    const { parentId } = req.params
    const { page, limit } = req.query
    const result = await commentService.getReplies(parentId, parseInt(page), parseInt(limit))
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const commentController = {
  createNew,
  getComments,
  getReplies
}
