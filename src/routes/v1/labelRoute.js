import express from 'express'
import { labelController } from '~/controllers/labelController'
import { labelValidation } from '~/validations/labelValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, labelValidation.createNew, labelController.createNew)

export const labelRouter = Router
