import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS, INVITATION_TTL_DAYS } from '~/utils/constants'
import { userModel } from './userModel'
import { boardModel } from './boardModel'
import { workspaceModel } from './workspaceModel'

// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // người đi mời
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // người được mời
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),

  // Lời mời là board thì sẽ lưu thêm dữ liệu boardInvitation - optional
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS)),
    respondedAt: Joi.date().timestamp('javascript').allow(null).default(null)
  }).optional(),

  // Lời mời vào workspace
  workspaceInvitation: Joi.object({
    workspaceId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  expiresAt: Joi.date().timestamp('javascript').default(
    () => Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000
  ),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    
    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }

    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
    return createdInvitation
  } catch (error) { 
    throw error
  }
}

const createNewWorkspaceInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }

    if (validData.workspaceInvitation) {
      newInvitationToAdd.workspaceInvitation = {
        ...validData.workspaceInvitation,
        workspaceId: new ObjectId(validData.workspaceInvitation.workspaceId)
      }
    }

    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
    return createdInvitation
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({
      _id: new ObjectId(invitationId)
    })
    return result
  } catch (error) { 
    throw new Error(error) 
  }
}

const expirePendingBoardInvitations = async (filter = {}) => {
  const now = new Date()
  return await GET_DB().collection(INVITATION_COLLECTION_NAME).updateMany(
    {
      ...filter,
      type: INVITATION_TYPES.BOARD_INVITATION,
      'boardInvitation.status': BOARD_INVITATION_STATUS.PENDING,
      expiresAt: { $lte: now }
    },
    {
      $set: {
        'boardInvitation.status': BOARD_INVITATION_STATUS.EXPIRED,
        'boardInvitation.respondedAt': now,
        updatedAt: now
      }
    }
  )
}

const findPendingBoardInvitation = async (boardId, inviteeId) => {
  await expirePendingBoardInvitations({
    'boardInvitation.boardId': new ObjectId(boardId),
    inviteeId: new ObjectId(inviteeId)
  })
  return await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({
    type: INVITATION_TYPES.BOARD_INVITATION,
    inviteeId: new ObjectId(inviteeId),
    'boardInvitation.boardId': new ObjectId(boardId),
    'boardInvitation.status': BOARD_INVITATION_STATUS.PENDING,
    _destroy: false
  })
}

const findByBoard = async (boardId) => {
  await expirePendingBoardInvitations({
    'boardInvitation.boardId': new ObjectId(boardId)
  })
  return await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
    {
      $match: {
        type: INVITATION_TYPES.BOARD_INVITATION,
        'boardInvitation.boardId': new ObjectId(boardId),
        _destroy: false
      }
    },
    {
      $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'inviteeId',
        foreignField: '_id',
        as: 'invitee',
        pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
      }
    },
    { $set: { invitee: { $first: '$invitee' } } },
    { $sort: { createdAt: -1 } }
  ]).toArray()
}

const transitionBoardInvitation = async ({
  invitationId,
  expectedStatuses,
  nextStatus,
  actorFilter = {},
  expiresAt = null,
  session = null
}) => {
  const now = new Date()
  const setData = {
    'boardInvitation.status': nextStatus,
    'boardInvitation.respondedAt': nextStatus === BOARD_INVITATION_STATUS.PENDING ? null : now,
    updatedAt: now
  }
  if (expiresAt) setData.expiresAt = expiresAt

  return await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
    {
      _id: new ObjectId(invitationId),
      ...actorFilter,
      'boardInvitation.status': { $in: expectedStatuses },
      _destroy: false
    },
    { $set: setData },
    { returnDocument: 'after', session }
  )
}

const initIndexes = async () => {
  const collection = GET_DB().collection(INVITATION_COLLECTION_NAME)
  const legacyPending = await collection.find({
    type: INVITATION_TYPES.BOARD_INVITATION,
    expiresAt: { $exists: false }
  }, { projection: { _id: 1, createdAt: 1 } }).toArray()

  if (legacyPending.length) {
    await collection.bulkWrite(legacyPending.map(invitation => ({
      updateOne: {
        filter: { _id: invitation._id },
        update: {
          $set: {
            expiresAt: new Date(
              new Date(invitation.createdAt).getTime() +
              INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000
            )
          }
        }
      }
    })))
  }
  await expirePendingBoardInvitations()

  await collection.createIndex(
    {
      type: 1,
      'boardInvitation.boardId': 1,
      inviteeId: 1,
      'boardInvitation.status': 1
    },
    {
      unique: true,
      partialFilterExpression: {
        type: INVITATION_TYPES.BOARD_INVITATION,
        'boardInvitation.status': BOARD_INVITATION_STATUS.PENDING,
        _destroy: false
      },
      name: 'unique_pending_board_invitation'
    }
  )
  await collection.createIndex({ expiresAt: 1 }, { name: 'invitation_expiry_lookup' })
}

const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId)
      }
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(invitationId) },
      { $set: updateData },
      { returnDocument: 'after' } // sẽ trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { 
    throw new Error(error) 
  }
}

// query tổng hợp (aggregate) để lấy những bản ghi invitation thuộc một user cụ thể
const findByUser = async (userId) => {
  try {

    const queryConditions = [
      { inviteeId: new ObjectId(userId) },
      { _destroy: false }
    ]

    const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'inviterId', // người đi mời
        foreignField: '_id',
        as: 'inviter',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'inviteeId', // người được mời
        foreignField: '_id',
        as: 'invitee',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: boardModel.BOARD_COLLECTION_NAME,
        localField: 'boardInvitation.boardId', // thông tin board được invite
        foreignField: '_id',
        as: 'board'
      } },
      { $lookup: {
        from: workspaceModel.WORKSPACE_COLLECTION_NAME,
        localField: 'workspaceInvitation.workspaceId', // thông tin workspace được invite
        foreignField: '_id',
        as: 'workspace'
      } }
    ]).toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  createNewWorkspaceInvitation,
  findOneById,
  findPendingBoardInvitation,
  findByBoard,
  transitionBoardInvitation,
  expirePendingBoardInvitations,
  initIndexes,
  update,
  findByUser
}
