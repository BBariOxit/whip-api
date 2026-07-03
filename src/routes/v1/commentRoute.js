import express from 'express'
import { commentController } from '~/controllers/commentController'
import { commentValidation } from '~/validations/commentValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'

const Router = express.Router()

// Comment gắn với card của 1 board. Ghi (tạo) cần member/admin (viewer là read-only);
// đọc (list/replies) cho phép cả viewer của board public. boardId được suy ra từ cardId/comment ở middleware.
Router.route('/')
  .post(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), commentValidation.createNew, commentController.createNew)
  .get(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member', 'viewer']), commentValidation.getComments, commentController.getComments)

Router.route('/:parentId/replies')
  .get(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member', 'viewer']), commentValidation.getReplies, commentController.getReplies)

// Sửa/xoá vẫn giữ thêm check chủ sở hữu comment ở tầng service (chỉ tác giả mới sửa/xoá được)
Router.route('/:id')
  .put(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), commentValidation.updateComment, commentController.updateComment)
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), commentValidation.deleteComment, commentController.deleteComment)

export const commentRouter = Router
