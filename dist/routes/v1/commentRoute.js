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
var Router = _express["default"].Router();
Router.route('/').post(_authMiddleware.authMiddleware.isAuthorized, _commentValidation.commentValidation.createNew, _commentController.commentController.createNew).get(_authMiddleware.authMiddleware.isAuthorized, _commentValidation.commentValidation.getComments, _commentController.commentController.getComments);
Router.route('/:parentId/replies').get(_authMiddleware.authMiddleware.isAuthorized, _commentValidation.commentValidation.getReplies, _commentController.commentController.getReplies);
Router.route('/:id').put(_authMiddleware.authMiddleware.isAuthorized, _commentValidation.commentValidation.updateComment, _commentController.commentController.updateComment)["delete"](_authMiddleware.authMiddleware.isAuthorized, _commentValidation.commentValidation.deleteComment, _commentController.commentController.deleteComment);
var commentRouter = Router;
exports.commentRouter = commentRouter;