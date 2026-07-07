"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invitationController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _invitationService = require("../services/invitationService");
var createNewBoardInvitation = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var inviterId, resInvitation, io;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          // User thực hiện request này chính là Inviter - người đi mời
          inviterId = req.jwtDecoded._id;
          _context.next = 4;
          return _invitationService.invitationService.createNewBoardInvitation(req.body, inviterId);
        case 4:
          resInvitation = _context.sent;
          // Emit realtime tới ĐÚNG người được mời (room riêng của user). Server-authoritative:
          // không broadcast lộ lời mời cho mọi client, và client không thể tự giả mạo lời mời.
          io = req.app.get('socketio');
          if (io && resInvitation !== null && resInvitation !== void 0 && resInvitation.inviteeId) {
            io.to("user:".concat(resInvitation.inviteeId)).emit('BE_USER_INVITED_TO_BOARD', resInvitation);
          }
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(resInvitation);
          _context.next = 13;
          break;
        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          next(_context.t0);
        case 13:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 10]]);
  }));
  return function createNewBoardInvitation(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var getInvitations = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var userId, resInvitations;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          userId = req.jwtDecoded._id;
          _context2.next = 4;
          return _invitationService.invitationService.getInvitations(userId);
        case 4:
          resInvitations = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(resInvitations);
          _context2.next = 11;
          break;
        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          next(_context2.t0);
        case 11:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 8]]);
  }));
  return function getInvitations(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var updateBoardInvitation = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var userId, invitationId, status, updatedInvitation;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          userId = req.jwtDecoded._id;
          invitationId = req.params.invitationId;
          status = req.body.status;
          _context3.next = 6;
          return _invitationService.invitationService.updateBoardInvitation(userId, invitationId, status);
        case 6:
          updatedInvitation = _context3.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedInvitation);
          _context3.next = 13;
          break;
        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          next(_context3.t0);
        case 13:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 10]]);
  }));
  return function updateBoardInvitation(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var invitationController = {
  createNewBoardInvitation: createNewBoardInvitation,
  getInvitations: getInvitations,
  updateBoardInvitation: updateBoardInvitation
};
exports.invitationController = invitationController;