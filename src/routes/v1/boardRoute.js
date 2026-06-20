import express from 'express'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardValidation } from '~/validations/boardValidation'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/templates')
  .get(authMiddleware.isAuthorized, boardController.getTemplates)

Router.route('/templates/clone')
  .post(authMiddleware.isAuthorized, boardController.cloneTemplate)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)
  .delete(authMiddleware.isAuthorized, boardController.deleteItem)

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong 1 board
Router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardifferentColumn, boardController.moveCardifferentColumn)

export const boardRouter = Router