import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const emailSchema = Joi.string().trim().lowercase().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE)

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: emailSchema,
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })

  try {
    req.body = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const verifyAccount = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: emailSchema,
    token: Joi.string().required()
  })

  try {
    req.body = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: emailSchema,
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })

  try {
    req.body = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    displayName: Joi.string().min(1).max(50).trim().strict()
  })

  try {
    // Chỉ nhận các field cập nhật tài khoản đã được khai báo ở trên.
    req.body = await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: false
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const changePassword = async (req, res, next) => {
  const correctCondition = Joi.object({
    current_password: Joi.string().required().pattern(PASSWORD_RULE).message(`current_password: ${PASSWORD_RULE_MESSAGE}`),
    new_password: Joi.string().required().pattern(PASSWORD_RULE).message(`new_password: ${PASSWORD_RULE_MESSAGE}`)
  })

  try {
    req.body = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const requestPasswordReset = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: emailSchema
  })

  try {
    req.body = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const resetPassword = async (req, res, next) => {
  const correctCondition = Joi.object({
    token: Joi.string().hex().length(64).required(),
    new_password: Joi.string().required().pattern(PASSWORD_RULE).message(`new_password: ${PASSWORD_RULE_MESSAGE}`)
  })

  try {
    req.body = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const googleLogin = async (req, res, next) => {
  const correctCondition = Joi.object({ credential: Joi.string().required() })
  try {
    req.body = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const githubLogin = async (req, res, next) => {
  const correctCondition = Joi.object({
    code: Joi.string().required(),
    redirectUri: Joi.string().uri({ scheme: ['http', 'https'] }).required()
  })
  try {
    req.body = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update,
  changePassword,
  requestPasswordReset,
  resetPassword,
  googleLogin,
  githubLogin
}
