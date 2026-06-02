import express from 'express'
import { activityController } from '~/controllers/activityController'
import { activityValidation } from '~/validations/activityValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, activityValidation.getActivities, activityController.getActivities)

export const activityRouter = Router
