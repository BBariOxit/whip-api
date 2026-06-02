import { activityModel } from '~/models/activityModel'

const createActivity = async (data) => {
  try {
    const createdActivity = await activityModel.createNew(data)
    return createdActivity
  } catch (error) {
    throw error
  }
}

const getActivities = async (cardId, page, limit) => {
  try {
    const result = await activityModel.getActivitiesByCardId(cardId, page, limit)
    return result
  } catch (error) {
    throw error
  }
}

export const activityService = {
  createActivity,
  getActivities
}
