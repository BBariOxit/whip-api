"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customFieldRouter = void 0;
var _express = _interopRequireDefault(require("express"));
var _customFieldController = require("../../controllers/customFieldController");
var _customFieldValidation = require("../../validations/customFieldValidation");
var _authMiddleware = require("../../middlewares/authMiddleware");
var Router = _express["default"].Router({
  mergeParams: true
}); // important: mergeParams to access boardId from parent route

Router.route('/').post(_authMiddleware.authMiddleware.isAuthorized, _customFieldValidation.customFieldValidation.createNew, _customFieldController.customFieldController.createNew);
Router.route('/:fieldId').put(_authMiddleware.authMiddleware.isAuthorized, _customFieldValidation.customFieldValidation.update, _customFieldController.customFieldController.update)["delete"](_authMiddleware.authMiddleware.isAuthorized, _customFieldController.customFieldController.deleteItem);
var customFieldRouter = Router;
exports.customFieldRouter = customFieldRouter;