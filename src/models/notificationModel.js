import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { NOTIFICATION_TYPES, NOTIFICATION_TTL_DAYS } from '~/utils/constants'

const NOTIFICATION_COLLECTION_NAME = 'notifications'
const NOTIFICATION_TTL_MS = NOTIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000

const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  // Người nhận thông báo
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(NOTIFICATION_TYPES)),
  // Nội dung đã render sẵn để FE hiển thị thẳng
  message: Joi.string().required(),

  // Ngữ cảnh (để điều hướng khi click) — đều optional
  actorId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),
  workspaceId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),
  boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),

  isRead: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  // Mốc hết hạn (BSON Date) — TTL index tự xoá notification khi qua mốc này
  expireAt: Joi.date().default(() => new Date(Date.now() + NOTIFICATION_TTL_MS)),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Tạo 1 notification, trả về document đầy đủ (để controller emit qua socket)
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const insertData = {
      ...validData,
      userId: new ObjectId(validData.userId),
      actorId: validData.actorId ? new ObjectId(validData.actorId) : null,
      workspaceId: validData.workspaceId ? new ObjectId(validData.workspaceId) : null,
      boardId: validData.boardId ? new ObjectId(validData.boardId) : null
    }
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).insertOne(insertData)
    return await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).findOne({ _id: result.insertedId })
  } catch (error) {
    throw new Error(error)
  }
}

// Tạo nhiều notification trong 1 lệnh insertMany (fan-out @all / board đông người)
const createMany = async (dataList) => {
  try {
    if (!Array.isArray(dataList) || dataList.length === 0) return []
    const validList = await Promise.all(dataList.map(d => validateBeforeCreate(d)))
    const insertData = validList.map(v => ({
      ...v,
      userId: new ObjectId(v.userId),
      actorId: v.actorId ? new ObjectId(v.actorId) : null,
      workspaceId: v.workspaceId ? new ObjectId(v.workspaceId) : null,
      boardId: v.boardId ? new ObjectId(v.boardId) : null
    }))
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).insertMany(insertData)
    // Trả về document đầy đủ kèm _id để controller emit socket (khỏi query lại)
    return insertData.map((doc, idx) => ({ ...doc, _id: result.insertedIds[idx] }))
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy các thông báo gần nhất của 1 user
const findByUser = async (userId, limit = 20) => {
  try {
    const results = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME)
      .find({ userId: new ObjectId(userId), _destroy: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

const countUnread = async (userId) => {
  try {
    return await GET_DB().collection(NOTIFICATION_COLLECTION_NAME)
      .countDocuments({ userId: new ObjectId(userId), isRead: false, _destroy: false })
  } catch (error) {
    throw new Error(error)
  }
}

// Đánh dấu đã đọc 1 thông báo (chỉ khi đúng chủ sở hữu)
const markRead = async (notificationId, userId) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(notificationId), userId: new ObjectId(userId) },
      { $set: { isRead: true } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const markAllRead = async (userId) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).updateMany(
      { userId: new ObjectId(userId), isRead: false, _destroy: false },
      { $set: { isRead: true } }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xoá (ẩn) 1 notification của chính user — soft delete qua cờ _destroy
const softDelete = async (notificationId, userId) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(notificationId), userId: new ObjectId(userId) },
      { $set: { _destroy: true } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Tạo index (idempotent) — gọi 1 lần lúc khởi động server
const initIndexes = async () => {
  const collection = GET_DB().collection(NOTIFICATION_COLLECTION_NAME)
  await Promise.all([
    // Liệt kê notification theo user, sort mới nhất trước
    collection.createIndex({ userId: 1, createdAt: -1 }),
    // Đếm chưa đọc / mark-all-read theo user + isRead
    collection.createIndex({ userId: 1, isRead: 1 }),
    // TTL: Mongo tự xoá document khi expireAt < hiện tại
    collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
  ])
}

export const notificationModel = {
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA,
  createNew,
  createMany,
  findByUser,
  countUnread,
  markRead,
  markAllRead,
  softDelete,
  initIndexes
}
