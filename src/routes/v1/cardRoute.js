import express from 'express'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.update,
    cardController.update)
  .delete(authMiddleware.isAuthorized, cardController.deleteItem)

// Archive Card API
Router.route('/:id/archive')
  .put(authMiddleware.isAuthorized, cardController.archiveCard)

Router.route('/:id/restore')
  .put(authMiddleware.isAuthorized, cardController.restoreCard)

// Attachment APIs: Upload và Xóa file đính kèm
Router.route('/:id/attachments')
  .post(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.uploadAttachment.single('attachmentFile'),
    cardController.uploadAttachment)
  .delete(authMiddleware.isAuthorized, cardController.deleteAttachment)

export const cardRouter = Router