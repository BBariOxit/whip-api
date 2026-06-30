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
var Router = _express["default"].Router();
Router.route('/').get(_authMiddleware.authMiddleware.isAuthorized, _activityValidation.activityValidation.getActivities, _activityController.activityController.getActivities);
var activityRouter = Router;
exports.activityRouter = activityRouter;