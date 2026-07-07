"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.labelRouter = void 0;
var _express = _interopRequireDefault(require("express"));
var _labelController = require("../../controllers/labelController");
var _labelValidation = require("../../validations/labelValidation");
var _authMiddleware = require("../../middlewares/authMiddleware");
var _rbacMiddleware = require("../../middlewares/rbacMiddleware");
var Router = _express["default"].Router();

// Label thuộc về 1 board -> chỉ member/admin của board đó mới được tạo/sửa/xoá (chặn viewer & người ngoài)
Router.route('/').post(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _labelValidation.labelValidation.createNew, _labelController.labelController.createNew);
Router.route('/:id').put(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _labelValidation.labelValidation.update, _labelController.labelController.update)["delete"](_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _labelValidation.labelValidation.deleteItem, _labelController.labelController.deleteItem);
var labelRouter = Router;
exports.labelRouter = labelRouter;