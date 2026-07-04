import express from 'express'
import { notificationController } from '~/controllers/notificationController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Danh sách notification của user đang đăng nhập
Router.route('/')
  .get(authMiddleware.isAuthorized, notificationController.getMyNotifications)

// Đánh dấu đã đọc tất cả
Router.route('/read-all')
  .put(authMiddleware.isAuthorized, notificationController.markAllRead)

// Đánh dấu đã đọc 1 notification
Router.route('/:id/read')
  .put(authMiddleware.isAuthorized, notificationController.markRead)

export const notificationRoute = Router
