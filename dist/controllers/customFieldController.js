"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customFieldController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _customFieldService = require("../services/customFieldService");
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var boardId, createdField;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          boardId = req.params.boardId;
          _context.next = 4;
          return _customFieldService.customFieldService.createNew(boardId, req.body);
        case 4:
          createdField = _context.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(createdField);
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
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var boardId, fieldId, updatedResult;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          boardId = req.params.boardId;
          fieldId = req.params.fieldId;
          _context2.next = 5;
          return _customFieldService.customFieldService.update(boardId, fieldId, req.body);
        case 5:
          updatedResult = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedResult);
          _context2.next = 12;
          break;
        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          next(_context2.t0);
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 9]]);
  }));
  return function update(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var boardId, fieldId, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          boardId = req.params.boardId;
          fieldId = req.params.fieldId;
          _context3.next = 5;
          return _customFieldService.customFieldService.deleteItem(boardId, fieldId);
        case 5:
          result = _context3.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context3.next = 12;
          break;
        case 9:
          _context3.prev = 9;
          _context3.t0 = _context3["catch"](0);
          next(_context3.t0);
        case 12:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 9]]);
  }));
  return function deleteItem(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var customFieldController = {
  createNew: createNew,
  update: update,
  deleteItem: deleteItem
};
exports.customFieldController = customFieldController;