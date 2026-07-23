import express from 'express'
import { invitationValidation } from '~/validations/invitationValidation'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'

const Router = express.Router()

Router.route('/board')
  .post(
    authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    requireBoardRole(['admin', 'member']),
    invitationController.createNewBoardInvitation
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

export const invitationRoute = Router
