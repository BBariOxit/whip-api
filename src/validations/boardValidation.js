import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { boardImportSchema } from '~/validations/importSchemas'

const createNew = async (req, res, next) => {
  // * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để cho Front-end tự validate và custom message phía FE cho đẹp. 
  // * Back-end chỉ cần validate Đảm Bảo Dữ Liệu Chuẩn Xác, và trả về message mặc định từ thư viện là được.
  // * Quan trọng: Việc Validate dữ liệu BẮT BUỘC phải có ở phía Back-end vì đây là điểm cuối để lưu trữ
  // dữ liệu vào Database.
  // * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn
  // validate dữ liệu ở cả Back-end và Front-end.
  const correctCondition = Joi.object({
    // custom thử
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title min 3 chars',
      'string.max': 'Title max 50 chars',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
    background: Joi.object({
      type: Joi.string().valid('gradient', 'solid', 'image').required(),
      color1: Joi.string().required(),
      color2: Joi.string().optional()
    }).optional(),
    workspaceId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).optional()
  })

  try {
    // chỉ định abortEarly: false để trường hợp có nhiều lỗi validations thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    // lưu ý ko dùng required trong trường hợp update
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    background: Joi.object({
      type: Joi.string().valid('gradient', 'solid', 'image').required(),
      color1: Joi.string().required(),
      color2: Joi.string().optional()
    }).optional(),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    // chỉ định abortEarly: false để trường hợp có nhiều lỗi validations thì trả về tất cả lỗi
    // đối với trường hợp update , cho phép unknown để ko cần đẩy một số field lên
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

const cloneTemplate = async (req, res, next) => {
  const correctCondition = Joi.object({
    templateBoardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
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

const moveCardifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),

    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nexCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false
    })

    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

// Validate file import board (INPUT KHÔNG TIN CẬY). Whitelist + stripUnknown loại field lạ/nhạy cảm.
// req.body được gán lại bằng bản đã strip sạch để service chỉ thấy dữ liệu hợp lệ.
const importBoard = async (req, res, next) => {
  const correctCondition = Joi.object({
    schemaVersion: Joi.number().valid(1).required(),
    // Bắt buộc kind = 'board' để KHÔNG thể import nhầm file workspace vào đây.
    kind: Joi.string().valid('board').required(),
    exportedAt: Joi.any().optional(),
    board: boardImportSchema.required()
  })

  try {
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

const importPersonalBoards = async (req, res, next) => {
  const boardEnvelopeSchema = Joi.object({
    schemaVersion: Joi.number().valid(1).required(),
    kind: Joi.string().valid('board').required(),
    exportedAt: Joi.any().optional(),
    excludedData: Joi.array().items(Joi.string()).optional(),
    board: boardImportSchema.required()
  })
  const correctCondition = Joi.object({
    schemaVersion: Joi.number().valid(1).required(),
    kind: Joi.string().valid('personal-boards').required(),
    exportedAt: Joi.any().optional(),
    count: Joi.number().integer().min(0).max(100).optional(),
    boards: Joi.array().max(100).items(boardEnvelopeSchema).required()
  })

  try {
    req.body = await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    })
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
    req.body = await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew,
  update,
  cloneTemplate,
  moveCardifferentColumn,
  importBoard,
  importPersonalBoards,
  transferOwnership
}
