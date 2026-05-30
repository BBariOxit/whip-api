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

export const labelController = {
  createNew
}
