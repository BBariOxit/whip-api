import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { WORKSPACE_ROLES } from '~/utils/constants'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { boardImportSchema } from '~/validations/importSchemas'

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

const transferOwnership = async (req, res, next) => {
  const correctCondition = Joi.object({
    targetUserId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateNotificationPrefs = async (req, res, next) => {
  const correctCondition = Joi.object({
    memberJoins: Joi.boolean(),
    boardChanges: Joi.boolean(),
    mentions: Joi.boolean(),
    boardActivity: Joi.boolean()
  }).min(1)

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const getActivities = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false, allowUnknown: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

// Validate file import (INPUT KHÔNG TIN CẬY). Chỉ cho phép đúng các field trong whitelist:
// stripUnknown sẽ tự loại bỏ mọi field lạ / nhạy cảm (attachments, memberIds, totalComments,
// _destroy, isTemplate, slug, ownerIds...) trước khi service dựng document ghi xuống DB.
// Đồng thời giới hạn kích thước mảng để chống DoS bằng file khổng lồ.
const importWorkspace = async (req, res, next) => {
  const correctCondition = Joi.object({
    schemaVersion: Joi.number().valid(1).required(),
    // Chặn nhầm file: file board (kind: 'board') sẽ không qua được cửa này.
    // Cho phép thiếu kind (mặc định 'workspace') để tương thích file export cũ chưa có trường này.
    kind: Joi.string().valid('workspace').default('workspace'),
    exportedAt: Joi.any().optional(),
    workspace: Joi.object({
      title: Joi.string().min(3).max(50).required(),
      description: Joi.string().max(256).allow('').default(''),
      visibility: Joi.string().valid('private', 'public').default('private')
    }).required(),
    boards: Joi.array().max(100).items(boardImportSchema).default([])
  })

  try {
    // Gán lại req.body bằng bản đã được strip sạch để tầng dưới chỉ thấy dữ liệu hợp lệ.
    req.body = await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const workspaceValidation = {
  createNew,
  update,
  importWorkspace,
  inviteMember,
  updateMemberRole,
  transferOwnership,
  updateNotificationPrefs,
  getActivities
}
