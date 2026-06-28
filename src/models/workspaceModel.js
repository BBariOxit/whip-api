import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const WORKSPACE_COLLECTION_NAME = 'workspaces'

const WORKSPACE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().max(255).trim().strict().default(''),
  ownerId: Joi.string().required(), 
  memberIds: Joi.array().items(Joi.string()).default([]), 
  
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const createNew = async (data) => {
  try {
    const validData = await WORKSPACE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const insertData = {
      ...validData,
      ownerId: new ObjectId(validData.ownerId),
      memberIds: [new ObjectId(validData.ownerId)] 
    }
    const db = await GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).insertOne(insertData)
    return result
  } catch (error) { 
    throw new Error(error) 
  }
}

const findById = async (id) => {
  try {
    const db = await GET_DB()
    const result = await db.collection(WORKSPACE_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) { 
    throw new Error(error) 
  }
}

const getWorkspacesByUserId = async (userId) => {
  try {
    const db = await GET_DB()
    const results = await db.collection(WORKSPACE_COLLECTION_NAME).find({
      memberIds: new ObjectId(userId),
      _destroy: false
    }).sort({ createdAt: -1 }).toArray()
    return results
  } catch (error) { 
    throw new Error(error) 
  }
}

const deleteOneById = async (workspaceId) => {
  try {
    const db = await GET_DB()
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
    const db = await GET_DB()
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

export const workspaceModel = {
  WORKSPACE_COLLECTION_NAME,
  WORKSPACE_COLLECTION_SCHEMA,
  createNew,
  findById,
  getWorkspacesByUserId,
  deleteOneById,
  update
}
