"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.labelService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _labelModel = require("../models/labelModel");
var _cardModel = require("../models/cardModel");
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(reqBody) {
    var newLabel, createdLabel, getNewLabel;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          newLabel = _objectSpread({}, reqBody);
          _context.next = 4;
          return _labelModel.labelModel.createNew(newLabel);
        case 4:
          createdLabel = _context.sent;
          _context.next = 7;
          return _labelModel.labelModel.findOneById(createdLabel.insertedId);
        case 7:
          getNewLabel = _context.sent;
          return _context.abrupt("return", getNewLabel);
        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          throw _context.t0;
        case 14:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 11]]);
  }));
  return function createNew(_x) {
    return _ref.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(labelId, updateData) {
    var updatedLabel;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return _labelModel.labelModel.update(labelId, updateData);
        case 3:
          updatedLabel = _context2.sent;
          return _context2.abrupt("return", updatedLabel);
        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;
        case 10:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 7]]);
  }));
  return function update(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(labelId) {
    var label;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return _labelModel.labelModel.findOneById(labelId);
        case 3:
          label = _context3.sent;
          if (label) {
            _context3.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Label not found!');
        case 6:
          _context3.next = 8;
          return _labelModel.labelModel.deleteOneById(labelId);
        case 8:
          _context3.next = 10;
          return _cardModel.cardModel.pullLabelFromCards(label.boardId, labelId);
        case 10:
          return _context3.abrupt("return", {
            deleteResult: 'Label and its references deleted successfully!'
          });
        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          throw _context3.t0;
        case 16:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 13]]);
  }));
  return function deleteItem(_x4) {
    return _ref3.apply(this, arguments);
  };
}();
var labelService = {
  createNew: createNew,
  update: update,
  deleteItem: deleteItem
};
exports.labelService = labelService;