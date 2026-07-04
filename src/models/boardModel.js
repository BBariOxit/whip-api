import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'
import { labelModel } from './labelModel'

// define collection (name & schema)

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE, BOARD_TYPES.WORKSPACE_VISIBLE).required(),
  background: Joi.object({
    type: Joi.string().valid('gradient', 'solid', 'image').required(),
    color1: Joi.string().required(),
    color2: Joi.string().optional()
  }).default({ type: 'gradient', color1: '#8a2387', color2: '#e94057' }),

  workspaceId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null).allow(null),


  // admin của board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // những thành viên của board
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Danh sách userId đã gắn sao (star) board này — mỗi user tự quản lý danh sách sao của mình
  starredBy: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  customFields: Joi.array().items(
    Joi.object({
      _id: Joi.string().required(),
      name: Joi.string().required().trim().strict(),
      type: Joi.string().valid('text', 'number', 'checkbox', 'dropdown', 'date').required(),
      options: Joi.array().items(
        Joi.object({
          _id: Joi.string().required(),
          text: Joi.string().required().trim().strict(),
          color: Joi.string().optional()
        })
      ).default([]),
      showOnFront: Joi.boolean().default(false)
    })
  ).default([]),

  isTemplate: Joi.boolean().default(false),
  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định ra những field mà chúng ta ko muốn cho phép cập nhật trong hàm update
// (các field nhạy cảm bên dưới đều được quản lý bằng method riêng: pushMemberIds, starBoard,
//  pushCustomField, deleteOneById... nên KHÔNG cho phép cập nhật qua generic update để chặn mass-assignment)
const INVALID_UPDATE_FIELDS = ['_id', 'createAt', 'createdAt', '_destroy', 'ownerIds', 'memberIds', 'starredBy', 'customFields', 'isTemplate', 'slug']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }

    if (newBoardToAdd.workspaceId) {
      newBoardToAdd.workspaceId = new ObjectId(newBoardToAdd.workspaceId)
    }

    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (boardId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(boardId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// query tổng hợp (aggregate) để lấy tonaf bộ columns và cards thuộc về board
const getDetails = async (userId, boardId) => {
  try {

    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false }
    ]

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns',
        pipeline: [{ $match: { _destroy: false } }]
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards',
        pipeline: [{ $match: { _destroy: false } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
        // $project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: labelModel.LABEL_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'labels'
      } },
      { $lookup: {
        from: 'workspaces', // workspaceModel.WORKSPACE_COLLECTION_NAME
        localField: 'workspaceId',
        foreignField: '_id',
        as: 'workspace'
      } },
      // unwind workspace to object instead of array (if workspace exists)
      { $unwind: { path: '$workspace', preserveNullAndEmptyArrays: true } },
      // lookup workspaceMembers
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'workspace.memberIds',
        foreignField: '_id',
        as: 'workspaceMembers',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}


// cập nhập push 1 giá trị column id vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Chèn 1 giá trị column id vào một vị trí chỉ định trong mảng columnOrderIds
const insertColumnIdAtIndex = async (boardId, columnId, targetIndex) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      {
        $push: {
          columnOrderIds: {
            $each: [new ObjectId(columnId)],
            $position: targetIndex
          }
        }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy một phần tử columnId ra khỏi mảng columnOrderIds
// Dùng $pull trong mongodb ở trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    // lọc những cái field mà chúng ta ko cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // đối với những dữ liệu liên quan tới ObjectId, biến đổi ở đây
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }
    if (updateData.workspaceId !== undefined) {
      if (updateData.workspaceId && updateData.workspaceId !== 'null') {
        updateData.workspaceId = new ObjectId(updateData.workspaceId)
      } else {
        updateData.workspaceId = null
      }
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { returnDocument: 'after' } // trả về kq mới sau khi cập nhật
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = [
      // điều kiện 1: board chưa bị xóa
      { _destroy: false },
      // Điều kiện 02: không phải là template
      { isTemplate: { $ne: true } }
    ]

    // Điều kiện 03: Phân quyền xem Board
    if (queryFilters && queryFilters.workspaceId && queryFilters.workspaceId !== 'null') {
      if (queryFilters.workspaceId === 'guest') {
        const db = GET_DB()
        const myWorkspaces = await db.collection('workspaces').find({
          'members.userId': new ObjectId(userId)
        }).toArray()
        
        const myWorkspaceIds = myWorkspaces.map(ws => ws._id)

        queryConditions.push({ workspaceId: { $ne: null } })
        queryConditions.push({ workspaceId: { $nin: myWorkspaceIds } })
        
        queryConditions.push({
          $or: [
            { ownerIds: { $all: [new ObjectId(userId)] } },
            { memberIds: { $all: [new ObjectId(userId)] } }
          ]
        })
        delete queryFilters.workspaceId
      } else {
        queryConditions.push({ workspaceId: new ObjectId(queryFilters.workspaceId) })
        // Nếu đang xem trong 1 workspace cụ thể -> được xem board workspace_visible, public, HOẶC là member/owner của private board
        queryConditions.push({
          $or: [
            { type: BOARD_TYPES.WORKSPACE_VISIBLE },
            { type: BOARD_TYPES.PUBLIC },
            { ownerIds: { $all: [new ObjectId(userId)] } },
            { memberIds: { $all: [new ObjectId(userId)] } }
          ]
        })
        delete queryFilters.workspaceId // Xóa để không bị duyệt lại ở vòng lặp filter dưới
      }
    } else {
      // Nếu đang xem ở ngoài (Personal boards) -> Bắt buộc phải là owner hoặc member
      queryConditions.push({
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      })
    }

    // xử lý query filter cho từng trường hợp search board (còn lại)
    if (queryFilters) {
      Object.keys(queryFilters).forEach(key => {
        if (key === 'workspaceId') {
          if (queryFilters[key] === 'null') {
            queryConditions.push({ workspaceId: null })
          }
        } else {
          queryConditions.push({ [key]: { $regex: new RegExp(queryFilters[key], 'i') } })
        }
      })
    }

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        { $sort: { title: 1 } },
        { $facet: { 
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage) },
            { $limit: itemsPerPage }
          ],
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]  
        } }
      ],
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getTemplates = async () => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).find({
      isTemplate: true,
      _destroy: false
    }).sort({ title: 1 }).collation({ locale: 'en' }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { memberIds: new ObjectId(userId) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pushCustomField = async (boardId, customField) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { customFields: customField } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateCustomField = async (boardId, fieldId, updateData) => {
  try {
    const setConditions = {}
    if (updateData.name !== undefined) setConditions['customFields.$[elem].name'] = updateData.name
    if (updateData.options !== undefined) setConditions['customFields.$[elem].options'] = updateData.options
    if (updateData.showOnFront !== undefined) setConditions['customFields.$[elem].showOnFront'] = updateData.showOnFront

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: setConditions },
      {
        arrayFilters: [{ 'elem._id': fieldId }],
        returnDocument: 'after'
      }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pullCustomField = async (boardId, fieldId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $pull: { customFields: { _id: fieldId } } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneById = async (boardId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(boardId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pullMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $pull: { memberIds: new ObjectId(userId) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findByWorkspaceId = async (workspaceId) => {
  try {
    const results = await GET_DB().collection(BOARD_COLLECTION_NAME).find({
      workspaceId: new ObjectId(workspaceId),
      _destroy: false
    }).toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Thêm userId vào mảng starredBy ($addToSet để tránh trùng lặp khi gọi nhiều lần)
const starBoard = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $addToSet: { starredBy: new ObjectId(userId) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Gỡ userId khỏi mảng starredBy
const unstarBoard = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $pull: { starredBy: new ObjectId(userId) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy danh sách board đã gắn sao của 1 user, kèm tên workspace (dùng $lookup để tránh N+1 query).
// Chỉ project đúng vài field cần cho dropdown để payload nhẹ nhất có thể.
const getStarredBoards = async (userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: {
          starredBy: new ObjectId(userId),
          _destroy: false,
          isTemplate: { $ne: true },
          // Bảo mật: chỉ trả về board user vẫn còn quyền xem. Phòng trường hợp board từng public
          // (đã được star) sau đó bị đổi thành private mà user không phải owner/member.
          $or: [
            { type: { $ne: BOARD_TYPES.PRIVATE } },
            { ownerIds: new ObjectId(userId) },
            { memberIds: new ObjectId(userId) }
          ]
        }
      },
      {
        $lookup: {
          from: 'workspaces', // workspaceModel.WORKSPACE_COLLECTION_NAME
          localField: 'workspaceId',
          foreignField: '_id',
          as: 'workspaceInfo'
        }
      },
      {
        $project: {
          title: 1,
          slug: 1,
          background: 1,
          // Bóc title của workspace đầu tiên (nếu là personal board thì workspaceInfo rỗng -> null)
          workspaceName: { $arrayElemAt: ['$workspaceInfo.title', 0] }
        }
      },
      { $sort: { title: 1 } }
    ], { collation: { locale: 'en' } }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  insertColumnIdAtIndex,
  update,
  pullColumnOrderIds,
  getBoards,
  getTemplates,
  pushMemberIds,
  pushCustomField,
  updateCustomField,
  pullCustomField,
  deleteOneById,
  findByWorkspaceId,
  pullMemberIds,
  starBoard,
  unstarBoard,
  getStarredBoards
}