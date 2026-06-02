import { activityModel } from '~/models/activityModel'

const createActivity = async (data) => {
  try {
    const createdActivity = await activityModel.createNew(data)
    return createdActivity
  } catch (error) {
    throw error
  }
}

const getActivities = async (cardId) => {
  try {
    const activities = await activityModel.getActivitiesByCardId(cardId)
    return activities
  } catch (error) {
    throw error
  }
}

export const activityService = {
  createActivity,
  getActivities
}
