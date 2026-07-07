"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userValidation = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _joi = _interopRequireDefault(require("joi"));
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _validators = require("../utils/validators");
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var correctCondition;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          correctCondition = _joi["default"].object({
            email: _joi["default"].string().required().pattern(_validators.EMAIL_RULE).message(_validators.EMAIL_RULE_MESSAGE),
            password: _joi["default"].string().required().pattern(_validators.PASSWORD_RULE).message(_validators.PASSWORD_RULE_MESSAGE)
          });
          _context.prev = 1;
          _context.next = 4;
          return correctCondition.validateAsync(req.body, {
            abortEarly: false
          });
        case 4:
          next();
          _context.next = 10;
          break;
        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](1);
          next(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, new Error(_context.t0).message));
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 7]]);
  }));
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var verifyAccount = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var correctCondition;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          correctCondition = _joi["default"].object({
            email: _joi["default"].string().required().pattern(_validators.EMAIL_RULE).message(_validators.EMAIL_RULE_MESSAGE),
            token: _joi["default"].string().required()
          });
          _context2.prev = 1;
          _context2.next = 4;
          return correctCondition.validateAsync(req.body, {
            abortEarly: false
          });
        case 4:
          next();
          _context2.next = 10;
          break;
        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](1);
          next(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, new Error(_context2.t0).message));
        case 10:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 7]]);
  }));
  return function verifyAccount(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var login = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var correctCondition;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          correctCondition = _joi["default"].object({
            email: _joi["default"].string().required().pattern(_validators.EMAIL_RULE).message(_validators.EMAIL_RULE_MESSAGE),
            password: _joi["default"].string().required().pattern(_validators.PASSWORD_RULE).message(_validators.PASSWORD_RULE_MESSAGE)
          });
          _context3.prev = 1;
          _context3.next = 4;
          return correctCondition.validateAsync(req.body, {
            abortEarly: false
          });
        case 4:
          next();
          _context3.next = 10;
          break;
        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](1);
          next(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, new Error(_context3.t0).message));
        case 10:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[1, 7]]);
  }));
  return function login(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var correctCondition;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          correctCondition = _joi["default"].object({
            displayName: _joi["default"].string().min(1).max(50).trim().strict(),
            current_password: _joi["default"].string().pattern(_validators.PASSWORD_RULE).message("current_password: ".concat(_validators.PASSWORD_RULE_MESSAGE)),
            new_password: _joi["default"].string().pattern(_validators.PASSWORD_RULE).message("new_password: ".concat(_validators.PASSWORD_RULE_MESSAGE))
          });
          _context4.prev = 1;
          _context4.next = 4;
          return correctCondition.validateAsync(req.body, {
            abortEarly: false,
            allowUnknown: true
          });
        case 4:
          next();
          _context4.next = 10;
          break;
        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](1);
          next(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, new Error(_context4.t0).message));
        case 10:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[1, 7]]);
  }));
  return function update(_x0, _x1, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var userValidation = {
  createNew: createNew,
  verifyAccount: verifyAccount,
  login: login,
  update: update
};
exports.userValidation = userValidation;