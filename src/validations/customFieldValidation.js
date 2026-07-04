import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().max(50).trim().strict(),
    type: Joi.string().valid('text', 'number', 'checkbox', 'dropdown', 'date').required(),
    options: Joi.array().items(
      Joi.object({
        _id: Joi.string().required(),
        text: Joi.string().required().max(50).trim().strict(),
        color: Joi.string().optional()
      })
    ).optional().default([]),
    showOnFront: Joi.boolean().default(false)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().max(50).trim().strict(),
    options: Joi.array().items(
      Joi.object({
        _id: Joi.string().required(),
        text: Joi.string().required().max(50).trim().strict(),
        color: Joi.string().optional()
      })
    ),
    showOnFront: Joi.boolean()
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const customFieldValidation = {
  createNew,
  update
}
