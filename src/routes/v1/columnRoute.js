import express from 'express'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)

Router.route('/:id')
  .put(authMiddleware.isAuthorized, columnValidation.update, columnController.update)
  .delete(authMiddleware.isAuthorized, columnValidation.deleteItem, columnController.deleteItem)

Router.route('/clear-cards/:id')
  .delete(authMiddleware.isAuthorized, columnController.clearAllCards)

Router.route('/:id/cards-layout')
  .put(authMiddleware.isAuthorized, columnController.updateAllCardsLayout)

// Archive Column API
Router.route('/:id/archive')
  .put(authMiddleware.isAuthorized, columnController.archiveColumn)

export const columnRouter = Router