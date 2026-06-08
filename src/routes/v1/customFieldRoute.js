import express from 'express'
import { customFieldController } from '~/controllers/customFieldController'
import { customFieldValidation } from '~/validations/customFieldValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router({ mergeParams: true }) // important: mergeParams to access boardId from parent route

Router.route('/')
  .post(authMiddleware.isAuthorized, customFieldValidation.createNew, customFieldController.createNew)

Router.route('/:fieldId')
  .put(authMiddleware.isAuthorized, customFieldValidation.update, customFieldController.update)
  .delete(authMiddleware.isAuthorized, customFieldController.deleteItem)

export const customFieldRouter = Router
