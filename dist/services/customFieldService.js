"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customFieldService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _boardModel = require("../models/boardModel");
var _cardModel = require("../models/cardModel");
var _mongodb = require("mongodb");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(boardId, reqBody) {
    var newFieldId, newCustomField;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          newFieldId = new _mongodb.ObjectId().toString();
          newCustomField = _objectSpread({
            _id: newFieldId
          }, reqBody);
          _context.next = 5;
          return _boardModel.boardModel.pushCustomField(boardId, newCustomField);
        case 5:
          return _context.abrupt("return", newCustomField);
        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          throw _context.t0;
        case 11:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 8]]);
  }));
  return function createNew(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(boardId, fieldId, updateData) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return _boardModel.boardModel.updateCustomField(boardId, fieldId, updateData);
        case 3:
          return _context2.abrupt("return", {
            updateResult: 'Successfully updated custom field!'
          });
        case 6:
          _context2.prev = 6;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;
        case 9:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 6]]);
  }));
  return function update(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(boardId, fieldId) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return _boardModel.boardModel.pullCustomField(boardId, fieldId);
        case 3:
          _context3.next = 5;
          return _cardModel.cardModel.pullCustomFieldValues(boardId, fieldId);
        case 5:
          return _context3.abrupt("return", {
            deleteResult: 'Custom field and its references deleted successfully!'
          });
        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          throw _context3.t0;
        case 11:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 8]]);
  }));
  return function deleteItem(_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();
var customFieldService = {
  createNew: createNew,
  update: update,
  deleteItem: deleteItem
};
exports.customFieldService = customFieldService;