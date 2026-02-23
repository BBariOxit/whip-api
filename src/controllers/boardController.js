import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardervice'


const createNew = async (req, res, next) => {
  try {
    // console.log('req.body', req.body)
    // console.log('req.query', req.query)
    // console.log('req.param', req.query)

    // điều hướng dữ liệu qua tầng service
    const createBoard = await boardService.createNew(req.body)

    // có kq thì trả về phía client
    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params', req.query)
    const boardId = req.params.id

    // điều hướng dữ liệu qua tầng service
    const board = await boardService.getDetails(boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails
}