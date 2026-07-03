import express from 'express'
import { labelController } from '~/controllers/labelController'
import { labelValidation } from '~/validations/labelValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'

const Router = express.Router()

// Label thuộc về 1 board -> chỉ member/admin của board đó mới được tạo/sửa/xoá (chặn viewer & người ngoài)
Router.route('/')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), labelValidation.createNew, labelController.createNew)

Router.route('/:id')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), labelValidation.update, labelController.update)
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), labelValidation.deleteItem, labelController.deleteItem)

export const labelRouter = Router
