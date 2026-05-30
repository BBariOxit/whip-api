import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const LABEL_COLLECTION_NAME = 'labels'
const LABEL_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().max(50).allow('').default(''),
  color: Joi.string().required(), // e.g. '#ff9f1a'
  createdAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await LABEL_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newLabelToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId)
    }
    const result = await GET_DB().collection(LABEL_COLLECTION_NAME).insertOne(newLabelToAdd)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (labelId) => {
  try {
    const result = await GET_DB().collection(LABEL_COLLECTION_NAME).findOne({
      _id: new ObjectId(labelId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const labelModel = {
  LABEL_COLLECTION_NAME,
  LABEL_COLLECTION_SCHEMA,
  createNew,
  findOneById
}
