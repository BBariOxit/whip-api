"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invitationRoute = void 0;
var _express = _interopRequireDefault(require("express"));
var _invitationValidation = require("../../validations/invitationValidation");
var _invitationController = require("../../controllers/invitationController");
var _authMiddleware = require("../../middlewares/authMiddleware");
var Router = _express["default"].Router();
Router.route('/board').post(_authMiddleware.authMiddleware.isAuthorized, _invitationValidation.invitationValidation.createNewBoardInvitation, _invitationController.invitationController.createNewBoardInvitation);

// Get invitations by User
Router.route('/').get(_authMiddleware.authMiddleware.isAuthorized, _invitationController.invitationController.getInvitations);

// Cập nhật một bản ghi Board Invitation
Router.route('/board/:invitationId').put(_authMiddleware.authMiddleware.isAuthorized, _invitationController.invitationController.updateBoardInvitation);
var invitationRoute = Router;
exports.invitationRoute = invitationRoute;