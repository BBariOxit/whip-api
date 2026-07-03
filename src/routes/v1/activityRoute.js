import express from 'express'
import { activityController } from '~/controllers/activityController'
import { activityValidation } from '~/validations/activityValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireBoardRole } from '~/middlewares/rbacMiddleware'

const Router = express.Router()

// Activity log của card thuộc 1 board -> chỉ ai xem được board (member/admin/viewer board public) mới đọc,
// chặn lộ lịch sử hoạt động của board private. boardId suy ra từ cardId (query) ở middleware.
Router.route('/')
  .get(authMiddleware.isAuthorized, requireBoardRole(['admin', 'member', 'viewer']), activityValidation.getActivities, activityController.getActivities)

export const activityRouter = Router
