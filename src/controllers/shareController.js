import { StatusCodes } from 'http-status-codes'
import { shareService } from '~/services/shareService'

const getBoard = async (req, res, next) => {
  try {
    const result = await shareService.getShareBoard(
      req.jwtDecoded?._id,
      req.params.boardId,
      req.boardAccessRole
    )
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getCard = async (req, res, next) => {
  try {
    const result = await shareService.getShareCard(
      req.jwtDecoded?._id,
      req.params.boardId,
      req.params.cardId,
      req.boardAccessRole
    )
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const shareController = {
  getBoard,
  getCard
}
