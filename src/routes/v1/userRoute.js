import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
import { authRateLimitMiddleware } from '~/middlewares/authRateLimitMiddleware'
import { accountController } from '~/controllers/accountController'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(authRateLimitMiddleware.login, userValidation.login, userController.login)

Router.route('/google-login')
  .post(authRateLimitMiddleware.oauth, userValidation.googleLogin, userController.googleLogin)

Router.route('/github-login')
  .post(authRateLimitMiddleware.oauth, userValidation.githubLogin, userController.githubLogin)

Router.route('/forgot-password')
  .post(
    authRateLimitMiddleware.passwordResetRequest,
    userValidation.requestPasswordReset,
    userController.requestPasswordReset
  )

Router.route('/reset-password')
  .post(
    authRateLimitMiddleware.passwordReset,
    userValidation.resetPassword,
    userController.resetPassword
  )

Router.route('/logout')
  .delete(authMiddleware.optionalAuth, userController.logout)

Router.route('/refresh_token')
  .get(userController.refreshToken)

Router.route('/update')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('avatar'),
    userValidation.update,
    userController.update
  )

Router.route('/change-password')
  .put(
    authMiddleware.isAuthorized,
    authRateLimitMiddleware.passwordChange,
    userValidation.changePassword,
    userController.changePassword
  )

Router.route('/export-data')
  .get(
    authMiddleware.isAuthorized,
    authRateLimitMiddleware.dataExport,
    accountController.exportAccountData
  )

Router.route('/export-personal-boards')
  .get(
    authMiddleware.isAuthorized,
    authRateLimitMiddleware.dataExport,
    accountController.exportPersonalBoards
  )

Router.route('/request-account-deletion')
  .post(
    authMiddleware.isAuthorized,
    authRateLimitMiddleware.accountDeletionRequest,
    accountController.requestAccountDeletion
  )

Router.route('/account')
  .delete(
    authMiddleware.isAuthorized,
    authRateLimitMiddleware.accountDeletion,
    userValidation.deleteAccount,
    accountController.deleteAccount
  )

export const userRoute = Router
