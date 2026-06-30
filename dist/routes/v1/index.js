"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.APIs_V1 = void 0;
var _express = _interopRequireDefault(require("express"));
var _httpStatusCodes = require("http-status-codes");
var _boardRoute = require("./boardRoute");
var _columnRoute = require("./columnRoute");
var _cardRoute = require("./cardRoute");
var _userRoute = require("./userRoute");
var _invitationRoute = require("./invitationRoute");
var _labelRoute = require("./labelRoute");
var _activityRoute = require("./activityRoute");
var _customFieldRoute = require("./customFieldRoute");
var _commentRoute = require("./commentRoute");
var _workspaceRoute = require("./workspaceRoute");
var Router = _express["default"].Router();
//check APIs v1/status
Router.get('/status', function (req, res) {
  res.status(_httpStatusCodes.StatusCodes.OK).json({
    message: 'APIs v1 are ready to use'
  });
});
// Board APIs
Router.use('/boards', _boardRoute.boardRouter);
Router.use('/boards/:boardId/custom-fields', _customFieldRoute.customFieldRouter);
// Column APIs
Router.use('/columns', _columnRoute.columnRouter);
// Card APIs
Router.use('/cards', _cardRoute.cardRouter);
// User APIs
Router.use('/users', _userRoute.userRoute);

// Invitation APIs
Router.use('/invitations', _invitationRoute.invitationRoute);

// Label APIs
Router.use('/labels', _labelRoute.labelRouter);

// Activity APIs
Router.use('/activities', _activityRoute.activityRouter);

// Comment APIs
Router.use('/comments', _commentRoute.commentRouter);

// Workspace APIs
Router.use('/workspaces', _workspaceRoute.workspaceRoute);
var APIs_V1 = Router;
exports.APIs_V1 = APIs_V1;