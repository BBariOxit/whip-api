import express from 'express'
import { workspaceController } from '~/controllers/workspaceController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { workspaceValidation } from '~/validations/workspaceValidation'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, workspaceController.getWorkspacesByUserId)
  .post(authMiddleware.isAuthorized, workspaceValidation.createNew, workspaceController.createNew)

Router.route('/:id')
  .put(authMiddleware.isAuthorized, workspaceValidation.update, workspaceController.update)
  .delete(authMiddleware.isAuthorized, workspaceController.deleteItem)

export const workspaceRoute = Router
