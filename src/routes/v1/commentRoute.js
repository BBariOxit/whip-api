import express from 'express'
import { commentController } from '~/controllers/commentController'
import { commentValidation } from '~/validations/commentValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, commentValidation.createNew, commentController.createNew)
  .get(authMiddleware.isAuthorized, commentValidation.getComments, commentController.getComments)

Router.route('/:parentId/replies')
  .get(authMiddleware.isAuthorized, commentValidation.getReplies, commentController.getReplies)

Router.route('/:id')
  .put(authMiddleware.isAuthorized, commentValidation.updateComment, commentController.updateComment)
  .delete(authMiddleware.isAuthorized, commentValidation.deleteComment, commentController.deleteComment)

export const commentRouter = Router
