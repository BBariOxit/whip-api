import express from 'express'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), cardValidation.createNew, cardController.createNew)

// Template routes (phải khai báo trước /:id để tránh conflict)
Router.route('/use-template')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), cardController.useTemplate)

// Duplicate/paste card: liên quan card nguồn + column đích (có thể khác board) nên quyền được kiểm
// trong service (ghi vào board đích cần member/admin, copy từ board khác cần quyền xem board nguồn)
Router.route('/duplicate')
  .post(authMiddleware.isAuthorized, cardValidation.duplicate, cardController.duplicateCard)

Router.route('/templates/:id')
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), cardController.deleteTemplate)

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    requireBoardRole(['admin', 'member']),
    cardValidation.update,
    cardController.update)
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), cardController.deleteItem)

// Archive Card API
Router.route('/:id/archive')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), cardController.archiveCard)

Router.route('/:id/restore')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), cardController.restoreCard)

// Save as Template
Router.route('/:id/save-as-template')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), cardController.saveAsTemplate)

// Attachment APIs: Upload và Xóa file đính kèm
Router.route('/:id/attachments')
  .post(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.uploadAttachment.single('attachmentFile'),
    requireBoardRole(['admin', 'member']),
    cardController.uploadAttachment)
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), cardController.deleteAttachment)

export const cardRouter = Router