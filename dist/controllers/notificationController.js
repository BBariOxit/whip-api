"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notificationController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _notificationService = require("../services/notificationService");
var getMyNotifications = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var userId, result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          userId = req.jwtDecoded._id;
          _context.next = 4;
          return _notificationService.notificationService.getForUser(userId);
        case 4:
          result = _context.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context.next = 11;
          break;
        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          next(_context.t0);
        case 11:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 8]]);
  }));
  return function getMyNotifications(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var markRead = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var userId, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          userId = req.jwtDecoded._id;
          _context2.next = 4;
          return _notificationService.notificationService.markAsRead(req.params.id, userId);
        case 4:
          result = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
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
  return function markRead(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var markAllRead = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var userId, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          userId = req.jwtDecoded._id;
          _context3.next = 4;
          return _notificationService.notificationService.markAllAsRead(userId);
        case 4:
          result = _context3.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context3.next = 11;
          break;
        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          next(_context3.t0);
        case 11:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 8]]);
  }));
  return function markAllRead(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var remove = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var userId, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          userId = req.jwtDecoded._id;
          _context4.next = 4;
          return _notificationService.notificationService.deleteNotification(req.params.id, userId);
        case 4:
          result = _context4.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context4.next = 11;
          break;
        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](0);
          next(_context4.t0);
        case 11:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 8]]);
  }));
  return function remove(_x0, _x1, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var notificationController = {
  getMyNotifications: getMyNotifications,
  markRead: markRead,
  markAllRead: markAllRead,
  remove: remove
};
exports.notificationController = notificationController;