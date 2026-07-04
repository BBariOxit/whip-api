import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { WORKSPACE_ROLES } from '~/utils/constants'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(30).trim().strict(),
    description: Joi.string().max(255).trim().strict().default('').allow('')
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
    title: Joi.string().min(3).max(30).trim().strict(),
    description: Joi.string().max(255).trim().strict().allow(''),
    visibility: Joi.string().valid('private', 'public'),
    invitePermission: Joi.string().valid('admin', 'all'),
    boardCreation: Joi.string().valid('all', 'admin'),
    boardDeletion: Joi.string().valid('admin', 'all')
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: false
    })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const inviteMember = async (req, res, next) => {
  const correctCondition = Joi.object({
    inviteeEmail: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    role: Joi.string().valid(WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.MEMBER).default(WORKSPACE_ROLES.MEMBER)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateMemberRole = async (req, res, next) => {
  const correctCondition = Joi.object({
    role: Joi.string().required().valid(WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.MEMBER)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const workspaceValidation = {
  createNew,
  update,
  inviteMember,
  updateMemberRole
}
