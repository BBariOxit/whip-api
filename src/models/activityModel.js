import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ACTIVITY_ACTION_TYPES } from '~/utils/constants'

// Define Collection (name & schema)
const ACTIVITY_COLLECTION_NAME = 'activities'
const ACTIVITY_COLLECTION_SCHEMA = Joi.object({
  cardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userEmail: Joi.string().required(),
  userAvatar: Joi.string().allow(null).default(null),
  userDisplayName: Joi.string().required(),

  // Loại hành động
  actionType: Joi.string().valid(...Object.values(ACTIVITY_ACTION_TYPES)).required(),

  // Nội dung mô tả hành động (VD: "đã đánh dấu hoàn thành")
  content: Joi.string().required(),

  // Dữ liệu bổ sung (VD: { newDate: 1717430400000 }) — FE tự format theo timezone user
  metadata: Joi.object().allow(null).default(null),

  createdAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await ACTIVITY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newActivity = {
      ...validData,
      cardId: new ObjectId(validData.cardId),
      userId: new ObjectId(validData.userId)
    }
    const result = await GET_DB().collection(ACTIVITY_COLLECTION_NAME).insertOne(newActivity)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Lấy danh sách activities theo cardId, sort mới nhất lên đầu, có phân trang
 */
const getActivitiesByCardId = async (cardId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit
    const query = { cardId: new ObjectId(cardId) }

    const [activities, total] = await Promise.all([
      GET_DB().collection(ACTIVITY_COLLECTION_NAME)
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      GET_DB().collection(ACTIVITY_COLLECTION_NAME)
        .countDocuments(query)
    ])

    return { activities, total }
  } catch (error) {
    throw new Error(error)
  }
}

export const activityModel = {
  ACTIVITY_COLLECTION_NAME,
  ACTIVITY_COLLECTION_SCHEMA,
  createNew,
  getActivitiesByCardId
}
