import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { WORKSPACE_ROLES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const WORKSPACE_COLLECTION_NAME = 'workspaces'

const WORKSPACE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().max(255).trim().strict().default(''),

  // Embedded members array thay thế cho ownerId + memberIds
  members: Joi.array().items(
    Joi.object({
      userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      role: Joi.string().valid(
        WORKSPACE_ROLES.OWNER,
        WORKSPACE_ROLES.ADMIN,
        WORKSPACE_ROLES.MEMBER
      ).default(WORKSPACE_ROLES.MEMBER),
      joinedAt: Joi.date().timestamp('javascript').default(Date.now)
    })
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Hàm tạo Workspace mới — người tạo tự động trở thành Owner
const createNew = async (userId, data) => {
  try {
    const validData = await WORKSPACE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const insertData = {
      ...validData,
      members: [
        {
          userId: new ObjectId(userId),
          role: WORKSPACE_ROLES.OWNER,
          joinedAt: Date.now()
        }
      ]
    }
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).insertOne(insertData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findById = async (id) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy tất cả workspace mà user là thành viên (bất kể role)
const getWorkspacesByUserId = async (userId) => {
  try {
    const db = GET_DB()
    const results = await db.collection(WORKSPACE_COLLECTION_NAME).find({
      'members.userId': new ObjectId(userId),
      _destroy: false
    }).sort({ createdAt: -1 }).toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneById = async (workspaceId) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(workspaceId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (workspaceId, validData) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(workspaceId) },
      { $set: validData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Thêm member mới vào workspace
const addMember = async (workspaceId, userId, role = WORKSPACE_ROLES.MEMBER) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(workspaceId) },
      {
        $push: {
          members: {
            userId: new ObjectId(userId),
            role: role,
            joinedAt: Date.now()
          }
        },
        $set: { updatedAt: Date.now() }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa member ra khỏi workspace
const removeMember = async (workspaceId, userId) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(workspaceId) },
      {
        $pull: {
          members: { userId: new ObjectId(userId) }
        },
        $set: { updatedAt: Date.now() }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật role của một member trong workspace
const updateMemberRole = async (workspaceId, userId, newRole) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(workspaceId),
        'members.userId': new ObjectId(userId)
      },
      {
        $set: {
          'members.$.role': newRole,
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm workspace có chứa member cụ thể với role cho phép
// Dùng bởi rbacMiddleware
const findByMemberWithRole = async (workspaceId, userId, allowedRoles) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOne({
      _id: new ObjectId(workspaceId),
      members: {
        $elemMatch: {
          userId: new ObjectId(userId),
          role: { $in: allowedRoles }
        }
      }
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy workspace detail kèm thông tin user (aggregate lookup)
const getDetailsWithMembers = async (workspaceId) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).aggregate([
      { $match: { _id: new ObjectId(workspaceId), _destroy: false } },
      // Unwind members array để lookup từng user
      { $unwind: { path: '$members', preserveNullAndEmptyArrays: true } },
      // Lookup user info cho từng member
      { $lookup: {
        from: 'users',
        localField: 'members.userId',
        foreignField: '_id',
        as: 'members.userInfo',
        pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
      } },
      // Unwind userInfo (vì lookup trả về array)
      { $unwind: { path: '$members.userInfo', preserveNullAndEmptyArrays: true } },
      // Group lại thành 1 workspace document với members array đầy đủ
      { $group: {
        _id: '$_id',
        title: { $first: '$title' },
        description: { $first: '$description' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        _destroy: { $first: '$_destroy' },
        members: {
          $push: {
            userId: '$members.userId',
            role: '$members.role',
            joinedAt: '$members.joinedAt',
            email: '$members.userInfo.email',
            displayName: '$members.userInfo.displayName',
            avatar: '$members.userInfo.avatar',
            username: '$members.userInfo.username'
          }
        }
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

export const workspaceModel = {
  WORKSPACE_COLLECTION_NAME,
  WORKSPACE_COLLECTION_SCHEMA,
  createNew,
  findById,
  getWorkspacesByUserId,
  deleteOneById,
  update,
  addMember,
  removeMember,
  updateMemberRole,
  findByMemberWithRole,
  getDetailsWithMembers
}
