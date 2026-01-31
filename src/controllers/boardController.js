import { StatusCodes } from 'http-status-codes'


const createNew = async (req, res, next) => {
  try {
    console.log('req.body', req.body)
    console.log('req.query', req.query)
    console.log('req.param', req.query)

    // điều hướng dữ liệu qua tầng service

    // có kq thì trả về phía client
    res.status(StatusCodes.CREATED).json({ message: 'POST from controller: API get new board' })
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew
}