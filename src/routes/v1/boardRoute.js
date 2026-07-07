import express from 'express'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardValidation } from '~/validations/boardValidation'
import { requireBoardAdmin, requireBoardRole } from '~/middlewares/rbacMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/templates')
  .get(authMiddleware.isAuthorized, boardController.getTemplates)

// Clone 1 board template thành board mới của chính user (personal + user làm owner).
// Chỉ cần đăng nhập: board mới luôn thuộc về người gọi, và service chặn clone thứ không phải template.
Router.route('/templates/clone')
  .post(authMiddleware.isAuthorized, boardValidation.cloneTemplate, boardController.cloneTemplate)

Router.route('/bulk-delete')
  .delete(authMiddleware.isAuthorized, boardController.bulkDeleteItems)

// Lưu ý: phải khai báo TRƯỚC route '/:id' để Express không match '/starred' thành param :id
Router.route('/starred')
  .get(authMiddleware.isAuthorized, boardController.getStarredBoards)

Router.route('/:id/archived-items')
  .get(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), boardController.getArchivedItems)

Router.route('/:id/card-templates')
  .get(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), boardController.getCardTemplates)

Router.route('/:id/column-templates')
  .get(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), boardController.getColumnTemplates)

Router.route('/:id')
  .get(authMiddleware.optionalAuth, requireBoardRole(['admin', 'member', 'viewer']), boardController.getDetails)
  .put(authMiddleware.isAuthorized, requireBoardAdmin, boardValidation.update, boardController.update)
  .delete(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member']), boardController.deleteItem)

Router.route('/:id/visibility')
  .put(authMiddleware.isAuthorized, requireBoardAdmin, boardController.updateVisibility)

// Gắn/gỡ sao board (toggle). Chỉ cần đăng nhập; phân quyền xem board được check ở tầng service.
Router.route('/:id/star')
  .put(authMiddleware.isAuthorized, boardController.toggleStarred)

Router.route('/:id/join')
  .post(authMiddleware.isAuthorized, boardController.joinBoard)

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong 1 board.
// Quyền + kiểm tra card/2 column cùng board được xử lý trong service (boardId suy từ card, không nhận từ client).
Router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardifferentColumn, boardController.moveCardifferentColumn)

Router.route('/:id/leave')
  .post(authMiddleware.isAuthorized, boardController.leaveBoard)

export const boardRouter = Router