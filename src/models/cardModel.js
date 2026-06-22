import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  layout: Joi.string().valid('compact', 'standard', 'detailed').default('detailed'),
  description: Joi.string().optional(),
  cover: Joi.string().default(null),
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  labelIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  
  // Tổng số lượng comment của card (denormalized)
  totalComments: Joi.number().default(0),

  // Due date fields
  dueDate: Joi.date().timestamp('javascript').default(null).allow(null),
  dueComplete: Joi.boolean().default(false),

  // Checklist subdocuments - mỗi card chứa mảng checklists, mỗi checklist chứa mảng items
  checklists: Joi.array().items(
    Joi.object({
      _id: Joi.string().required(),
      title: Joi.string().required().min(1).max(100).trim().strict(),
      items: Joi.array().items(
        Joi.object({
          _id: Joi.string().required(),
          title: Joi.string().required().min(1).max(500).trim().strict(),
          isCompleted: Joi.boolean().default(false)
        })
      ).default([])
    })
  ).default([]),

  // Attachments - file đính kèm nhúng vào bản ghi Card
  attachments: Joi.array().items(
    Joi.object({
      url: Joi.string().required(),           // Link file trên Cloudinary
      publicId: Joi.string().required(),      // Cloudinary public_id (để xóa file)
      filename: Joi.string().required(),      // Tên file gốc (vd: tailieu.pdf)
      format: Joi.string().required(),        // Định dạng (png, jpg, pdf...)
      createdAt: Joi.date().timestamp('javascript').default(Date.now)
    })
  ).default([]),

  // Custom field values
  customFieldValues: Joi.array().items(
    Joi.object({
      customFieldId: Joi.string().required(),
      value: Joi.any().allow(null, '')
    })
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định ra những field mà chúng ta ko muốn cho phép cập nhật trong hàm update
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newCardToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId)
    }
    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
    return createdCard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (cardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(cardId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (cardId, updateData) => {
  try {
    // lọc những cái field mà chúng ta ko cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData(fieldName)
      }
    })

    // đối với những dữ liệu liên quan tới ObjectId, biến đổi ở đây
    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId)
    }
    if (updateData.labelIds) {
      updateData.labelIds = updateData.labelIds.map(_id => new ObjectId(_id))
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateData },
      { returnDocument: 'after' } // trả về kq mới sau khi cập nhật
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
      columnId: new ObjectId(columnId),
      _destroy: false
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneById = async (cardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(cardId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateManyCardsLayoutByColumnId = async (columnId, newLayout) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateMany(
      { columnId: new ObjectId(columnId) },
      { $set: { layout: newLayout } }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const incrementTotalComments = async (cardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $inc: { totalComments: 1 } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const decrementTotalComments = async (cardId, amount) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $inc: { totalComments: -amount } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Hàm này sẽ có nhiệm vụ xử lý cập nhật thêm hoặc xóa member khỏi card dựa theo
Action
 * sẽ dùng $push để thêm hoặc $pull để loại bỏ ($pull trong mongodb để lấy một phần
tử ra khỏi mảng rồi xóa nó đi)
 */
const updateMembers = async (cardId, incomingMemberInfo) => {
  try {
    // Tạo ra một biến updateCondition ban đầu là rỗng
    let updateCondition = {}
    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
      // console.log('Trường hợp Add, dùng $push: ', incomingMemberInfo)
      updateCondition = { $push: { memberIds: new ObjectId(incomingMemberInfo.userId) } }
    }
    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.REMOVE) {
      // console.log('Trường hợp Remove, dùng $pull: ', incomingMemberInfo)
      updateCondition = { $pull: { memberIds: new ObjectId(incomingMemberInfo.userId) } }
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      updateCondition, // truyền cái updateCondition ở đây
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const pullLabelFromCards = async (boardId, labelId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateMany(
      { boardId: new ObjectId(boardId) },
      { $pull: { labelIds: new ObjectId(labelId) } }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Đẩy một attachment mới vào cuối mảng attachments của card
 */
const pushNewAttachment = async (cardId, attachment) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $push: { attachments: attachment } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Xóa một attachment khỏi mảng attachments dựa theo publicId
 */
const pullAttachment = async (cardId, publicId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $pull: { attachments: { publicId: publicId } } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pullCustomFieldValues = async (boardId, fieldId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateMany(
      { boardId: new ObjectId(boardId) },
      { $pull: { customFieldValues: { customFieldId: fieldId } } }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const archiveCard = async (cardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: { _destroy: true, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const archiveManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateMany(
      { columnId: new ObjectId(columnId) },
      { $set: { _destroy: true, updatedAt: Date.now() } }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByBoardId = async (boardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
      boardId: new ObjectId(boardId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getArchivedByBoardId = async (boardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).find({
      boardId: new ObjectId(boardId),
      _destroy: true
    }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const restoreCard = async (cardId, newColumnId = null) => {
  try {
    const updateData = { _destroy: false, updatedAt: Date.now() }
    if (newColumnId) {
      updateData.columnId = new ObjectId(newColumnId)
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const restoreManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateMany(
      { columnId: new ObjectId(columnId) },
      { $set: { _destroy: false, updatedAt: Date.now() } }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId,
  deleteManyByBoardId,
  updateMembers,
  incrementTotalComments,
  decrementTotalComments,
  pullLabelFromCards,
  pushNewAttachment,
  pullAttachment,
  pullCustomFieldValues,
  deleteOneById,
  updateManyCardsLayoutByColumnId,
  archiveCard,
  archiveManyByColumnId,
  getArchivedByBoardId,
  restoreCard,
  restoreManyByColumnId
}