import { StatusCodes } from 'http-status-codes'
import { activityService } from '~/services/activityService'

const getActivities = async (req, res, next) => {
  try {
    const cardId = req.query.cardId
    const activities = await activityService.getActivities(cardId)

    res.status(StatusCodes.OK).json(activities)
  } catch (error) {
    next(error)
  }
}

export const activityController = {
  getActivities
}
