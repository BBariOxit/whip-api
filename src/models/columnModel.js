import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  isTemplate: Joi.boolean().default(false),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định ra những field mà chúng ta ko muốn cho phép cập nhật trong hàm update
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt', '_destroy', 'isTemplate']

const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newColumnToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId)
    }
    const createdColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd)
    return createdColumn
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (columnId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
      _id: new ObjectId(columnId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pushCardOrderIds = async (card) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(card.columnId) },
      { $push: { cardOrderIds: new ObjectId(card._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// pull 1 giá trị card id ra khỏi mảng cardOrderIds
const pullCardOrderIds = async (card) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(card.columnId) },
      { $pull: { cardOrderIds: new ObjectId(card._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// làm rỗng mảng cardOrderIds
const emptyCardOrderIds = async (columnId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(columnId) },
      { $set: { cardOrderIds: [] } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (columnId, updateData) => {
  try {
    // lọc những cái field mà chúng ta ko cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // đối với những dữ liệu liên quan tới ObjectId, biến đổi ở đây
    if (updateData.cardOrderIds) {
      updateData.cardOrderIds = updateData.cardOrderIds.map(_id => (new ObjectId(_id)))
    }

    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(columnId) },
      { $set: updateData },
      { returnDocument: 'after' } // trả về kq mới sau khi cập nhật
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneById = async (columnId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(columnId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByBoardId = async (boardId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteMany({
      boardId: new ObjectId(boardId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const archiveColumn = async (columnId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(columnId) },
      { $set: { _destroy: true, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getArchivedByBoardId = async (boardId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).find({
      boardId: new ObjectId(boardId),
      _destroy: true
    }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const restoreColumn = async (columnId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(columnId) },
      { $set: { _destroy: false, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const saveAsTemplate = async (columnId) => {
  try {
    const db = GET_DB()
    const originalColumn = await db.collection(COLUMN_COLLECTION_NAME).findOne({ _id: new ObjectId(columnId) })
    if (!originalColumn) throw new Error('Column not found!')

    // 1. Create Column Template
    const newColumnTemplate = {
      boardId: originalColumn.boardId,
      title: originalColumn.title,
      isTemplate: true,
      cardOrderIds: [],
      createdAt: Date.now(),
      updatedAt: null,
      _destroy: false
    }
    const createdColumn = await db.collection(COLUMN_COLLECTION_NAME).insertOne(newColumnTemplate)
    const newColumnId = createdColumn.insertedId

    // 2. Fetch all active cards of the original column
    const cards = await db.collection('cards').find({
      columnId: originalColumn._id,
      _destroy: false,
      isTemplate: { $ne: true } // exclude inner templates if any (handles missing field too)
    }).toArray()

    // 3. Clone cards as templates
    if (cards.length > 0) {
      const templateCardsToInsert = cards.map(card => ({
        boardId: card.boardId,
        columnId: newColumnId,
        title: card.title,
        layout: card.layout || 'detailed',
        description: card.description || null,
        cover: card.cover || null,
        memberIds: card.memberIds || [],
        labelIds: card.labelIds || [],
        totalComments: 0,
        dueDate: null,
        dueComplete: false,
        checklists: (card.checklists || []).map(cl => ({
          ...cl,
          _id: new ObjectId().toString(),
          items: (cl.items || []).map(item => ({
            ...item,
            _id: new ObjectId().toString(),
            isCompleted: false
          }))
        })),
        attachments: card.attachments || [],
        customFieldValues: card.customFieldValues || [],
        isTemplate: true,
        _destroy: false,
        createdAt: Date.now(),
        updatedAt: null
      }))

      const insertedCards = await db.collection('cards').insertMany(templateCardsToInsert)
      const insertedCardIds = Object.values(insertedCards.insertedIds)
      
      // Update cardOrderIds of the new Column Template
      await db.collection(COLUMN_COLLECTION_NAME).updateOne(
        { _id: newColumnId },
        { $set: { cardOrderIds: insertedCardIds } }
      )
    }

    return await db.collection(COLUMN_COLLECTION_NAME).findOne({ _id: newColumnId })
  } catch (error) {
    throw new Error(error)
  }
}

const getTemplatesByBoardId = async (boardId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).aggregate([
      { $match: { boardId: new ObjectId(boardId), isTemplate: true, _destroy: false } },
      { $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'columnId',
          as: 'cards'
      }}
    ]).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const useTemplate = async (templateId, boardId) => {
  try {
    const db = GET_DB()
    const templateColumn = await db.collection(COLUMN_COLLECTION_NAME).findOne({
      _id: new ObjectId(templateId),
      isTemplate: true
    })
    if (!templateColumn) throw new Error('Column Template not found!')

    // 1. Create new Column
    const newColumnData = {
      boardId: new ObjectId(boardId),
      title: templateColumn.title,
      isTemplate: false,
      cardOrderIds: [],
      createdAt: Date.now(),
      updatedAt: null,
      _destroy: false
    }
    const createdColumn = await db.collection(COLUMN_COLLECTION_NAME).insertOne(newColumnData)
    const newColumnId = createdColumn.insertedId

    // 2. Fetch all template cards inside this column template
    const templateCards = await db.collection('cards').find({
      columnId: templateColumn._id,
      isTemplate: true,
      _destroy: false
    }).toArray()

    // 3. Clone template cards as real cards
    if (templateCards.length > 0) {
      const realCardsToInsert = templateCards.map(card => ({
        boardId: new ObjectId(boardId),
        columnId: newColumnId,
        title: card.title,
        layout: card.layout || 'detailed',
        description: card.description || null,
        cover: card.cover || null,
        memberIds: card.memberIds || [],
        labelIds: card.labelIds || [],
        totalComments: 0,
        dueDate: null,
        dueComplete: false,
        checklists: (card.checklists || []).map(cl => ({
          ...cl,
          _id: new ObjectId().toString(),
          items: (cl.items || []).map(item => ({
            ...item,
            _id: new ObjectId().toString(),
            isCompleted: false
          }))
        })),
        attachments: (card.attachments || []).map(att => ({
          ...att,
          createdAt: Date.now()
        })),
        customFieldValues: card.customFieldValues || [],
        isTemplate: false,
        _destroy: false,
        createdAt: Date.now(),
        updatedAt: null
      }))

      const insertedCards = await db.collection('cards').insertMany(realCardsToInsert)
      const insertedCardIds = Object.values(insertedCards.insertedIds)
      
      // Update cardOrderIds of the new Column
      await db.collection(COLUMN_COLLECTION_NAME).updateOne(
        { _id: newColumnId },
        { $set: { cardOrderIds: insertedCardIds } }
      )
    }

    return await db.collection(COLUMN_COLLECTION_NAME).findOne({ _id: newColumnId })
  } catch (error) {
    throw new Error(error)
  }
}

const deleteTemplate = async (templateId) => {
  try {
    const db = GET_DB()
    const result = await db.collection(COLUMN_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(templateId),
      isTemplate: true
    })
    
    if (result.deletedCount > 0) {
      // Xoá các template cards con
      await db.collection('cards').deleteMany({
        columnId: new ObjectId(templateId),
        isTemplate: true
      })
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  update,
  deleteOneById,
  deleteManyByBoardId,
  pullCardOrderIds,
  emptyCardOrderIds,
  archiveColumn,
  getArchivedByBoardId,
  restoreColumn,
  saveAsTemplate,
  getTemplatesByBoardId,
  useTemplate,
  deleteTemplate
}