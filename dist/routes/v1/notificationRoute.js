"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notificationRoute = void 0;
var _express = _interopRequireDefault(require("express"));
var _notificationController = require("../../controllers/notificationController");
var _authMiddleware = require("../../middlewares/authMiddleware");
var Router = _express["default"].Router();

// Danh sách notification của user đang đăng nhập
Router.route('/').get(_authMiddleware.authMiddleware.isAuthorized, _notificationController.notificationController.getMyNotifications);

// Đánh dấu đã đọc tất cả
Router.route('/read-all').put(_authMiddleware.authMiddleware.isAuthorized, _notificationController.notificationController.markAllRead);

// Đánh dấu đã đọc 1 notification
Router.route('/:id/read').put(_authMiddleware.authMiddleware.isAuthorized, _notificationController.notificationController.markRead);

// Xoá (ẩn) 1 notification của chính user
Router.route('/:id')["delete"](_authMiddleware.authMiddleware.isAuthorized, _notificationController.notificationController.remove);
var notificationRoute = Router;
exports.notificationRoute = notificationRoute;