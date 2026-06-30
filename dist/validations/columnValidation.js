"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.columnValidation = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _joi = _interopRequireDefault(require("joi"));
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _validators = require("../utils/validators");
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var correctCondition, errorMessage, customError;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          correctCondition = _joi["default"].object({
            boardId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
            title: _joi["default"].string().required().min(3).max(50).trim().strict()
          });
          _context.prev = 1;
          _context.next = 4;
          return correctCondition.validateAsync(req.body, {
            abortEarly: false
          });
        case 4:
          next();
          _context.next = 12;
          break;
        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](1);
          errorMessage = new Error(_context.t0).message;
          customError = new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
          next(customError);
        case 12:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 7]]);
  }));
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var correctCondition, errorMessage, customError;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          correctCondition = _joi["default"].object({
            // nếu cần làm tính năng di chuyển column sang board khác thì mới validate boardId
            // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
            title: _joi["default"].string().min(3).max(50).trim().strict(),
            cardOrderIds: _joi["default"].array().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))
          });
          _context2.prev = 1;
          _context2.next = 4;
          return correctCondition.validateAsync(req.body, {
            abortEarly: false,
            allowUnknown: true
          });
        case 4:
          next();
          _context2.next = 12;
          break;
        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](1);
          errorMessage = new Error(_context2.t0).message;
          customError = new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
          next(customError);
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 7]]);
  }));
  return function update(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var correctCondition, errorMessage, customError;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          correctCondition = _joi["default"].object({
            id: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE)
          });
          _context3.prev = 1;
          _context3.next = 4;
          return correctCondition.validateAsync(req.params);
        case 4:
          next();
          _context3.next = 12;
          break;
        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](1);
          errorMessage = new Error(_context3.t0).message;
          customError = new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
          next(customError);
        case 12:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[1, 7]]);
  }));
  return function deleteItem(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var columnValidation = {
  createNew: createNew,
  update: update,
  deleteItem: deleteItem
};
exports.columnValidation = columnValidation;