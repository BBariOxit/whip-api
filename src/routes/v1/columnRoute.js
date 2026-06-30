import express from 'express'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnValidation.createNew, columnController.createNew)

Router.route('/:id')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnValidation.update, columnController.update)
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnValidation.deleteItem, columnController.deleteItem)

Router.route('/clear-cards/:id')
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnController.clearAllCards)

Router.route('/:id/cards-layout')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnController.updateAllCardsLayout)

// Archive Column API
Router.route('/:id/archive')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnController.archiveColumn)

Router.route('/:id/restore')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnController.restoreColumn)

// Template APIs
Router.route('/:id/save-as-template')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnController.saveAsTemplate)

// For using a template, boardId should be in body, so requireBoardRole will work.
Router.route('/use-template')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnController.useColumnTemplate)

Router.route('/templates/:id')
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnController.deleteColumnTemplate)

Router.route('/duplicate')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), columnController.duplicateColumn)

export const columnRouter = Router