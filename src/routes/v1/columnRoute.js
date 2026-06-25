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

Router.route('/:id/restore')
  .put(authMiddleware.isAuthorized, columnController.restoreColumn)

// Template APIs
Router.route('/:id/save-as-template')
  .post(authMiddleware.isAuthorized, columnController.saveAsTemplate)

Router.route('/use-template')
  .post(authMiddleware.isAuthorized, columnController.useColumnTemplate)

Router.route('/templates/:id')
  .delete(authMiddleware.isAuthorized, columnController.deleteColumnTemplate)

Router.route('/duplicate')
  .post(authMiddleware.isAuthorized, columnController.duplicateColumn)

export const columnRouter = Router