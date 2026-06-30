"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boardValidation = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _joi = _interopRequireDefault(require("joi"));
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _constants = require("../utils/constants");
var _validators = require("../utils/validators");
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var correctCondition, errorMessage, customError;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          // * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để cho Front-end tự validate và custom message phía FE cho đẹp. 
          // * Back-end chỉ cần validate Đảm Bảo Dữ Liệu Chuẩn Xác, và trả về message mặc định từ thư viện là được.
          // * Quan trọng: Việc Validate dữ liệu BẮT BUỘC phải có ở phía Back-end vì đây là điểm cuối để lưu trữ
          // dữ liệu vào Database.
          // * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn
          // validate dữ liệu ở cả Back-end và Front-end.
          correctCondition = _joi["default"].object({
            // custom thử
            title: _joi["default"].string().required().min(3).max(50).trim().strict().messages({
              'any.required': 'Title is required',
              'string.empty': 'Title is not allowed to be empty',
              'string.min': 'Title min 3 chars',
              'string.max': 'Title max 50 chars',
              'string.trim': 'Title must not have leading or trailing whitespace'
            }),
            description: _joi["default"].string().required().min(3).max(256).trim().strict(),
            type: _joi["default"].string().valid(_constants.BOARD_TYPES.PUBLIC, _constants.BOARD_TYPES.PRIVATE).required(),
            background: _joi["default"].object({
              type: _joi["default"].string().valid('gradient', 'solid', 'image').required(),
              color1: _joi["default"].string().required(),
              color2: _joi["default"].string().optional()
            }).optional(),
            workspaceId: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE).allow(null).optional()
          });
          _context.prev = 1;
          _context.next = 4;
          return correctCondition.validateAsync(req.body, {
            abortEarly: false
          });
        case 4:
          // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
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
            // lưu ý ko dùng required trong trường hợp update
            title: _joi["default"].string().min(3).max(50).trim().strict(),
            description: _joi["default"].string().min(3).max(256).trim().strict(),
            type: _joi["default"].string().valid(_constants.BOARD_TYPES.PUBLIC, _constants.BOARD_TYPES.PRIVATE),
            background: _joi["default"].object({
              type: _joi["default"].string().valid('gradient', 'solid', 'image').required(),
              color1: _joi["default"].string().required(),
              color2: _joi["default"].string().optional()
            }).optional(),
            columnOrderIds: _joi["default"].array().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))
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
var moveCardifferentColumn = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var correctCondition, errorMessage, customError;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          correctCondition = _joi["default"].object({
            currCardId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
            prevColumnId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
            prevCardOrderIds: _joi["default"].array().required().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE)),
            nextColumnId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
            nexCardOrderIds: _joi["default"].array().required().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))
          });
          _context3.prev = 1;
          _context3.next = 4;
          return correctCondition.validateAsync(req.body, {
            abortEarly: false
          });
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
  return function moveCardifferentColumn(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var boardValidation = {
  createNew: createNew,
  update: update,
  moveCardifferentColumn: moveCardifferentColumn
};
exports.boardValidation = boardValidation;