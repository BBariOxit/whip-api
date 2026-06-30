"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.labelModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _joi = _interopRequireDefault(require("joi"));
var _mongodb = require("../config/mongodb");
var _mongodb2 = require("mongodb");
var _validators = require("../utils/validators");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var LABEL_COLLECTION_NAME = 'labels';
var LABEL_COLLECTION_SCHEMA = _joi["default"].object({
  boardId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  title: _joi["default"].string().max(50).allow('')["default"](''),
  color: _joi["default"].string().required(),
  // e.g. '#ff9f1a'
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now)
});
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return LABEL_COLLECTION_SCHEMA.validateAsync(data, {
            abortEarly: false
          });
        case 2:
          return _context.abrupt("return", _context.sent);
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function validateBeforeCreate(_x) {
    return _ref.apply(this, arguments);
  };
}();
var createNew = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
    var validData, newLabelToAdd, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          newLabelToAdd = _objectSpread(_objectSpread({}, validData), {}, {
            boardId: new _mongodb2.ObjectId(validData.boardId)
          });
          _context2.next = 7;
          return (0, _mongodb.GET_DB)().collection(LABEL_COLLECTION_NAME).insertOne(newLabelToAdd);
        case 7:
          result = _context2.sent;
          return _context2.abrupt("return", result);
        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 14:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 11]]);
  }));
  return function createNew(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
var findOneById = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(labelId) {
    var result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return (0, _mongodb.GET_DB)().collection(LABEL_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(labelId)
          });
        case 3:
          result = _context3.sent;
          return _context3.abrupt("return", result);
        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          throw new Error(_context3.t0);
        case 10:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 7]]);
  }));
  return function findOneById(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(id, updateData) {
    var result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return (0, _mongodb.GET_DB)().collection(LABEL_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(id)
          }, {
            $set: updateData
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context4.sent;
          return _context4.abrupt("return", result);
        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](0);
          throw new Error(_context4.t0);
        case 10:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 7]]);
  }));
  return function update(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();
var deleteOneById = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(id) {
    var result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return (0, _mongodb.GET_DB)().collection(LABEL_COLLECTION_NAME).deleteOne({
            _id: new _mongodb2.ObjectId(id)
          });
        case 3:
          result = _context5.sent;
          return _context5.abrupt("return", result);
        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          throw new Error(_context5.t0);
        case 10:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 7]]);
  }));
  return function deleteOneById(_x6) {
    return _ref5.apply(this, arguments);
  };
}();
var labelModel = {
  LABEL_COLLECTION_NAME: LABEL_COLLECTION_NAME,
  LABEL_COLLECTION_SCHEMA: LABEL_COLLECTION_SCHEMA,
  createNew: createNew,
  findOneById: findOneById,
  update: update,
  deleteOneById: deleteOneById
};
exports.labelModel = labelModel;