import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { WORKSPACE_ACTIVITY_TYPES, WORKSPACE_ACTIVITY_TTL_DAYS } from '~/utils/constants'

// Define Collection (name & schema)
// Tách riêng khỏi collection 'activities' (vốn gắn với cardId) vì phạm vi khác hẳn: cấp workspace.
const WORKSPACE_ACTIVITY_COLLECTION_NAME = 'workspace_activities'
const WORKSPACE_ACTIVITY_TTL_MS = WORKSPACE_ACTIVITY_TTL_DAYS * 24 * 60 * 60 * 1000

// Cấu trúc "Who – Did What – To Whom – When":
//   actorId/actorName = WHO, actionType = DID WHAT, targetName = TO WHOM/WHAT, createdAt = WHEN.
const WORKSPACE_ACTIVITY_COLLECTION_SCHEMA = Joi.object({
  workspaceId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  // WHO — người thực hiện hành động
  actorId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  // Snapshot tên/avatar tại thời điểm ghi log — để vẫn hiển thị đúng dù sau này actor rời workspace/đổi tên
  actorName: Joi.string().required(),
  actorAvatar: Joi.string().allow(null).default(null),

  // DID WHAT — loại hành động (cấp workspace)
  actionType: Joi.string().valid(...Object.values(WORKSPACE_ACTIVITY_TYPES)).required(),

  // TO WHOM/WHAT — đối tượng bị tác động, dạng chuỗi hiển thị sẵn (board title, email được mời, tên member...)
  targetName: Joi.string().allow(null).default(null),

  // Dữ liệu bổ sung để FE tự dựng câu hiển thị (VD: { boardId }, { role }, { settingKey, settingValue })
  metadata: Joi.object().allow(null).default(null),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  // Mốc hết hạn (BSON Date) — TTL index tự xoá activity cũ khi qua mốc này
  expireAt: Joi.date().default(() => new Date(Date.now() + WORKSPACE_ACTIVITY_TTL_MS))
})

const validateBeforeCreate = async (data) => {
  return await WORKSPACE_ACTIVITY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newActivity = {
      ...validData,
      workspaceId: new ObjectId(validData.workspaceId),
      actorId: new ObjectId(validData.actorId)
    }
    const result = await GET_DB().collection(WORKSPACE_ACTIVITY_COLLECTION_NAME).insertOne(newActivity)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Lấy danh sách activities của 1 workspace, sort mới nhất lên đầu, có phân trang.
 */
const getByWorkspaceId = async (workspaceId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit
    const query = { workspaceId: new ObjectId(workspaceId) }

    const [activities, total] = await Promise.all([
      GET_DB().collection(WORKSPACE_ACTIVITY_COLLECTION_NAME)
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      GET_DB().collection(WORKSPACE_ACTIVITY_COLLECTION_NAME)
        .countDocuments(query)
    ])

    return { activities, total }
  } catch (error) {
    throw new Error(error)
  }
}

// Tạo index (idempotent) — gọi 1 lần lúc khởi động server
const initIndexes = async () => {
  const collection = GET_DB().collection(WORKSPACE_ACTIVITY_COLLECTION_NAME)
  await Promise.all([
    // Liệt kê activity theo workspace, sort mới nhất trước
    collection.createIndex({ workspaceId: 1, createdAt: -1 }),
    // TTL: Mongo tự xoá document khi expireAt < hiện tại
    collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
  ])
}

export const workspaceActivityModel = {
  WORKSPACE_ACTIVITY_COLLECTION_NAME,
  WORKSPACE_ACTIVITY_COLLECTION_SCHEMA,
  createNew,
  getByWorkspaceId,
  initIndexes
}
