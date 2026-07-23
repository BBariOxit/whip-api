import express from 'express'
import { invitationValidation } from '~/validations/invitationValidation'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'
import { authRateLimitMiddleware } from '~/middlewares/authRateLimitMiddleware'

const Router = express.Router()

Router.route('/board')
  .post(
    authMiddleware.isAuthorized,
    authRateLimitMiddleware.invitationMutation,
    invitationValidation.createNewBoardInvitation,
    requireBoardRole(['admin', 'member']),
    invitationController.createNewBoardInvitation
  )

Router.route('/board')
  .get(
    authMiddleware.isAuthorized,
    invitationValidation.listBoardInvitations,
    requireBoardRole(['admin', 'member']),
    invitationController.getBoardInvitations
  )

// Get invitations by User
Router.route('/')
  .get(authMiddleware.isAuthorized, invitationController.getInvitations)

// Cập nhật một bản ghi Board Invitation
Router.route('/board/:invitationId')
  .put(
    authMiddleware.isAuthorized,
    invitationValidation.updateBoardInvitation,
    invitationController.updateBoardInvitation
  )
  .delete(
    authMiddleware.isAuthorized,
    authRateLimitMiddleware.invitationMutation,
    invitationValidation.boardInvitationId,
    invitationController.cancelBoardInvitation
  )

Router.route('/board/:invitationId/resend')
  .post(
    authMiddleware.isAuthorized,
    authRateLimitMiddleware.invitationMutation,
    invitationValidation.boardInvitationId,
    invitationController.resendBoardInvitation
  )

export const invitationRoute = Router
