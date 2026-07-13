import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'
import { shareController } from '~/controllers/shareController'

const Router = express.Router()
const BOARD_VIEW_ROLES = ['admin', 'member', 'viewer']

Router.route('/boards/:boardId')
  .get(
    authMiddleware.optionalAuth,
    requireBoardRole(BOARD_VIEW_ROLES),
    shareController.getBoard
  )

Router.route('/boards/:boardId/cards/:cardId')
  .get(
    authMiddleware.optionalAuth,
    requireBoardRole(BOARD_VIEW_ROLES),
    shareController.getCard
  )

export const shareRouter = Router
