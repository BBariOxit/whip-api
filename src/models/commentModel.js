import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const COMMENT_COLLECTION_NAME = 'comments'
const COMMENT_COLLECTION_SCHEMA = Joi.object({
  cardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userEmail: Joi.string().required(),
  userAvatar: Joi.string().allow(null).default(null),
  userDisplayName: Joi.string().required(),
  content: Joi.string().required(),
  
  // Trỏ về comment gốc nếu đây là một reply
  parentId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),
  
  // Tag tên người bị reply (Hệ phái 2)
  replyToUserDisplayName: Joi.string().allow(null).default(null),
  
  // Tổng số lượt phản hồi cho comment này
  replyCount: Joi.number().default(0),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await COMMENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newComment = {
      ...validData,
      cardId: new ObjectId(validData.cardId),
      userId: new ObjectId(validData.userId),
      parentId: validData.parentId ? new ObjectId(validData.parentId) : null
    }
    const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).insertOne(newComment)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (commentId) => {
  try {
    const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).findOne({
      _id: new ObjectId(commentId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getCommentsByCardId = async (cardId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit
    const query = { cardId: new ObjectId(cardId), parentId: null } // Chỉ lấy comment gốc

    const [comments, total] = await Promise.all([
      GET_DB().collection(COMMENT_COLLECTION_NAME)
        .find(query)
        .sort({ createdAt: -1 }) // Comment mới nhất lên đầu
        .skip(skip)
        .limit(limit)
        .toArray(),
      GET_DB().collection(COMMENT_COLLECTION_NAME)
        .countDocuments(query)
    ])

    return { comments, total }
  } catch (error) {
    throw new Error(error)
  }
}

const getRepliesByParentId = async (parentId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit
    const query = { parentId: new ObjectId(parentId) }

    const [comments, total] = await Promise.all([
      GET_DB().collection(COMMENT_COLLECTION_NAME)
        .find(query)
        .sort({ createdAt: 1 }) // Reply thì cũ lên đầu (như youtube)
        .skip(skip)
        .limit(limit)
        .toArray(),
      GET_DB().collection(COMMENT_COLLECTION_NAME)
        .countDocuments(query)
    ])

    return { comments, total }
  } catch (error) {
    throw new Error(error)
  }
}

const incrementReplyCount = async (commentId) => {
  try {
    await GET_DB().collection(COMMENT_COLLECTION_NAME).updateOne(
      { _id: new ObjectId(commentId) },
      { $inc: { replyCount: 1 } }
    )
  } catch (error) {
    throw new Error(error)
  }
}

const decrementReplyCount = async (commentId) => {
  try {
    await GET_DB().collection(COMMENT_COLLECTION_NAME).updateOne(
      { _id: new ObjectId(commentId) },
      { $inc: { replyCount: -1 } }
    )
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (commentId, updateData) => {
  try {
    const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(commentId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteById = async (commentId) => {
  try {
    const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(commentId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByParentId = async (parentId) => {
  try {
    const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).deleteMany({
      parentId: new ObjectId(parentId)
    })
    return result.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

export const commentModel = {
  COMMENT_COLLECTION_NAME,
  COMMENT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getCommentsByCardId,
  getRepliesByParentId,
  incrementReplyCount,
  decrementReplyCount,
  update,
  deleteById,
  deleteManyByParentId
}
