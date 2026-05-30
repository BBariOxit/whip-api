import { labelModel } from '~/models/labelModel'

const createNew = async (reqBody) => {
  try {
    const newLabel = {
      ...reqBody
    }
    const createdLabel = await labelModel.createNew(newLabel)
    const getNewLabel = await labelModel.findOneById(createdLabel.insertedId)

    return getNewLabel
  } catch (error) {
    throw error
  }
}

export const labelService = {
  createNew
}
