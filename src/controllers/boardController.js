import { StatusCodes } from 'http-status-codes'


const createNew = async (req, res, next) => {
  try {
    console.log('req.body', req.body)
    console.log('req.query', req.query)
    console.log('req.param', req.query)

    throw new Error('test error!')
    // res.status(StatusCodes.CREATED).json({ message: 'POST from controller: API get new board' })
  } catch (error) {
    next(error)
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    //   errors: error.message
    // })
  }
}

export const boardController = {
  createNew
}