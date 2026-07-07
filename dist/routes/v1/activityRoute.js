"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activityRouter = void 0;
var _express = _interopRequireDefault(require("express"));
var _activityController = require("../../controllers/activityController");
var _activityValidation = require("../../validations/activityValidation");
var _authMiddleware = require("../../middlewares/authMiddleware");
var _rbacMiddleware = require("../../middlewares/rbacMiddleware");
var Router = _express["default"].Router();

// Activity log của card thuộc 1 board -> chỉ ai xem được board (member/admin/viewer board public) mới đọc,
// chặn lộ lịch sử hoạt động của board private. boardId suy ra từ cardId (query) ở middleware.
Router.route('/').get(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member', 'viewer']), _activityValidation.activityValidation.getActivities, _activityController.activityController.getActivities);
var activityRouter = Router;
exports.activityRouter = activityRouter;