import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_INVITATION_STATUS } from '~/utils/constants'

const createNewBoardInvitation = async (req, res, next) => {
  const correctCondition = Joi.object({
    inviteeEmail: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateBoardInvitation = async (req, res, next) => {
  const paramsSchema = Joi.object({
    invitationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })
  const bodySchema = Joi.object({
    status: Joi.string()
      .required()
      .valid(BOARD_INVITATION_STATUS.ACCEPTED, BOARD_INVITATION_STATUS.REJECTED)
  })

  try {
    await Promise.all([
      paramsSchema.validateAsync(req.params, { abortEarly: false }),
      bodySchema.validateAsync(req.body, { abortEarly: false })
    ])
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const invitationValidation = {
  createNewBoardInvitation,
  updateBoardInvitation
}
