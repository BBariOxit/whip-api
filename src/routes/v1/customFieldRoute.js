import express from 'express'
import { customFieldController } from '~/controllers/customFieldController'
import { customFieldValidation } from '~/validations/customFieldValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'

const Router = express.Router({ mergeParams: true }) // important: mergeParams to access boardId from parent route

// Custom field là cấu hình của board (:boardId lấy từ parent route) -> chỉ member/admin mới được đụng
Router.route('/')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), customFieldValidation.createNew, customFieldController.createNew)

Router.route('/:fieldId')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), customFieldValidation.update, customFieldController.update)
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), customFieldController.deleteItem)

export const customFieldRouter = Router
