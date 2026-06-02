import { StatusCodes } from 'http-status-codes'
import { activityService } from '~/services/activityService'

const getActivities = async (req, res, next) => {
  try {
    const cardId = req.query.cardId
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = parseInt(req.query.limit) || 10

    const result = await activityService.getActivities(cardId, page, limit)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const activityController = {
  getActivities
}
