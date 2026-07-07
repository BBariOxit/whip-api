"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentRouter = void 0;
var _express = _interopRequireDefault(require("express"));
var _commentController = require("../../controllers/commentController");
var _commentValidation = require("../../validations/commentValidation");
var _authMiddleware = require("../../middlewares/authMiddleware");
var _rbacMiddleware = require("../../middlewares/rbacMiddleware");
var Router = _express["default"].Router();

// Comment gắn với card của 1 board. Ghi (tạo) cần member/admin (viewer là read-only);
// đọc (list/replies) cho phép cả viewer của board public. boardId được suy ra từ cardId/comment ở middleware.
Router.route('/').post(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _commentValidation.commentValidation.createNew, _commentController.commentController.createNew).get(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member', 'viewer']), _commentValidation.commentValidation.getComments, _commentController.commentController.getComments);
Router.route('/:parentId/replies').get(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member', 'viewer']), _commentValidation.commentValidation.getReplies, _commentController.commentController.getReplies);

// Sửa/xoá vẫn giữ thêm check chủ sở hữu comment ở tầng service (chỉ tác giả mới sửa/xoá được)
Router.route('/:id').put(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _commentValidation.commentValidation.updateComment, _commentController.commentController.updateComment)["delete"](_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _commentValidation.commentValidation.deleteComment, _commentController.commentController.deleteComment);
var commentRouter = Router;
exports.commentRouter = commentRouter;