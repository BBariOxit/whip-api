import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB, GET_CLIENT } from '~/config/mongodb'
import { WORKSPACE_ROLES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'

const WORKSPACE_COLLECTION_NAME = 'workspaces'

// Tuỳ chọn thông báo mặc định cho mỗi thành viên (cá nhân theo từng workspace)
const DEFAULT_NOTIFICATION_PREFS = {
  memberJoins: true,
  boardChanges: true,
  mentions: true,
  boardActivity: false
}

const NOTIFICATION_PREFS_SCHEMA = Joi.object({
  memberJoins: Joi.boolean().default(true),
  boardChanges: Joi.boolean().default(true),
  mentions: Joi.boolean().default(true),
  boardActivity: Joi.boolean().default(false)
}).default(DEFAULT_NOTIFICATION_PREFS)

const WORKSPACE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().max(255).trim().strict().default(''),

  // Logo (Cloudinary secure_url)
  logo: Joi.string().uri().allow(null).default(null),

  // Access & Security settings
  visibility: Joi.string().valid('private', 'public').default('private'),
  invitePermission: Joi.string().valid('admin', 'all').default('admin'),
  boardCreation: Joi.string().valid('all', 'admin').default('all'),
  boardDeletion: Joi.string().valid('admin', 'all').default('admin'),

  // Embedded members array
  members: Joi.array().items(
    Joi.object({
      userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),
      email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).required(),
      role: Joi.string().valid(
        WORKSPACE_ROLES.OWNER,
        WORKSPACE_ROLES.ADMIN,
        WORKSPACE_ROLES.MEMBER
      ).default(WORKSPACE_ROLES.MEMBER),
      status: Joi.string().valid('active', 'pending').default('active'),
      inviteToken: Joi.string().allow(null).default(null),
      joinedAt: Joi.date().timestamp('javascript').default(Date.now),
      // Tuỳ chọn thông báo cá nhân của thành viên này trong workspace
      notificationPrefs: NOTIFICATION_PREFS_SCHEMA
    })
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Hàm tạo Workspace mới — người tạo tự động trở thành Owner
const createNew = async (userId, email, data) => {
  try {
    const validData = await WORKSPACE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const insertData = {
      ...validData,
      members: [
        {
          userId: new ObjectId(userId),
          email: email,
          role: WORKSPACE_ROLES.OWNER,
          status: 'active',
          inviteToken: null,
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
      members: {
        $elemMatch: {
          userId: new ObjectId(userId),
          status: 'active'
        }
      },
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

// Tìm thành viên theo email trong workspace
const findMemberByEmail = async (workspaceId, email) => {
  try {
    const db = GET_DB()
    const workspace = await db.collection(WORKSPACE_COLLECTION_NAME).findOne({
      _id: new ObjectId(workspaceId),
      members: { $elemMatch: { email: email } }
    })
    return workspace ? workspace.members.find(m => m.email === email) : null
  } catch (error) {
    throw new Error(error)
  }
}

// Chấp nhận lời mời (chuyển status pending -> active, gán userId, xóa token)
const acceptInviteMember = async (workspaceId, inviteToken, userId) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      { 
        _id: new ObjectId(workspaceId),
        'members.inviteToken': inviteToken
      },
      {
        $set: {
          'members.$.userId': new ObjectId(userId),
          'members.$.status': 'active',
          'members.$.inviteToken': null,
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

// Tìm workspace theo invite token
const findByInviteToken = async (inviteToken) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOne({
      'members.inviteToken': inviteToken
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa member ra khỏi workspace (được dùng để xóa member hoặc hủy pending invite)
const removeMember = async (workspaceId, userIdOrEmail) => {
  try {
    const db = GET_DB()
    // Nếu là ID thì xóa theo userId, nếu là email thì xóa theo email (cho pending member)
    const pullCondition = userIdOrEmail.includes('@') 
      ? { email: userIdOrEmail }
      : { userId: new ObjectId(userIdOrEmail) }
      
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(workspaceId) },
      {
        $pull: { members: pullCondition },
        $set: { updatedAt: Date.now() }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật role của member
const updateMemberRole = async (workspaceId, userIdOrEmail, newRole) => {
  try {
    const db = GET_DB()
    const matchCondition = userIdOrEmail.includes('@')
      ? { email: userIdOrEmail }
      : { userId: new ObjectId(userIdOrEmail) }

    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(workspaceId),
        'members': { $elemMatch: matchCondition }
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

// Chuyển quyền sở hữu: owner hiện tại -> admin, member được chọn -> owner (atomic)
const transferOwnership = async (workspaceId, currentOwnerUserId, newOwnerUserId) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(workspaceId) },
      {
        $set: {
          'members.$[oldOwner].role': WORKSPACE_ROLES.ADMIN,
          'members.$[newOwner].role': WORKSPACE_ROLES.OWNER,
          updatedAt: Date.now()
        }
      },
      {
        arrayFilters: [
          { 'oldOwner.userId': new ObjectId(currentOwnerUserId) },
          { 'newOwner.userId': new ObjectId(newOwnerUserId) }
        ],
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật tuỳ chọn thông báo cá nhân cho 1 member (set nguyên object cho gọn)
const updateMemberNotificationPrefs = async (workspaceId, userId, prefs) => {
  try {
    const db = GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(workspaceId) },
      {
        $set: {
          'members.$[m].notificationPrefs': prefs,
          updatedAt: Date.now()
        }
      },
      {
        arrayFilters: [{ 'm.userId': new ObjectId(userId) }],
        returnDocument: 'after'
      }
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
          role: { $in: allowedRoles },
          status: 'active'
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
        logo: { $first: '$logo' },
        // Access & Security settings
        visibility: { $first: '$visibility' },
        invitePermission: { $first: '$invitePermission' },
        boardCreation: { $first: '$boardCreation' },
        boardDeletion: { $first: '$boardDeletion' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        _destroy: { $first: '$_destroy' },
        members: {
          $push: {
            userId: '$members.userId',
            role: '$members.role',
            joinedAt: '$members.joinedAt',
            status: '$members.status',
            // Dùng email gốc trong members array (trường hợp pending chưa có userInfo), 
            // nếu active thì dùng email của userInfo (nhưng thực ra trùng nhau)
            email: '$members.email', 
            displayName: { $ifNull: ['$members.userInfo.displayName', 'Pending User'] },
            avatar: { $ifNull: ['$members.userInfo.avatar', null] },
            username: { $ifNull: ['$members.userInfo.username', null] }
          }
        }
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Ghi toàn bộ workspace + boards/columns/cards/labels trong MỘT transaction (all-or-nothing).
// Nếu bất kỳ bước nào lỗi, transaction rollback => không để lại workspace/board mồ côi.
// Dùng string literal cho tên collection khác (giống cách boardModel tham chiếu 'workspaces')
// để tránh vòng lặp import giữa các model.
const importWorkspace = async ({ workspaceDoc, boardDocs, columnDocs, cardDocs, labelDocs }) => {
  const session = GET_CLIENT().startSession()
  try {
    await session.withTransaction(async () => {
      const db = GET_DB()
      await db.collection(WORKSPACE_COLLECTION_NAME).insertOne(workspaceDoc, { session })
      // insertMany ném lỗi nếu mảng rỗng => chỉ ghi khi có dữ liệu.
      if (boardDocs.length) await db.collection('boards').insertMany(boardDocs, { session })
      if (columnDocs.length) await db.collection('columns').insertMany(columnDocs, { session })
      if (cardDocs.length) await db.collection('cards').insertMany(cardDocs, { session })
      if (labelDocs.length) await db.collection('labels').insertMany(labelDocs, { session })
    })
    return workspaceDoc._id
  } finally {
    await session.endSession()
  }
}

export const workspaceModel = {
  WORKSPACE_COLLECTION_NAME,
  importWorkspace,
  WORKSPACE_COLLECTION_SCHEMA,
  DEFAULT_NOTIFICATION_PREFS,
  updateMemberNotificationPrefs,
  createNew,
  findById,
  getWorkspacesByUserId,
  deleteOneById,
  update,
  addMember,
  removeMember,
  updateMemberRole,
  transferOwnership,
  findByMemberWithRole,
  getDetailsWithMembers,
  findMemberByEmail,
  acceptInviteMember,
  findByInviteToken
}
