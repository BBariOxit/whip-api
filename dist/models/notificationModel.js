"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notificationModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _joi = _interopRequireDefault(require("joi"));
var _mongodb = require("mongodb");
var _mongodb2 = require("../config/mongodb");
var _validators = require("../utils/validators");
var _constants = require("../utils/constants");
var _Joi$string$required;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var NOTIFICATION_COLLECTION_NAME = 'notifications';
var NOTIFICATION_TTL_MS = _constants.NOTIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000;
var NOTIFICATION_COLLECTION_SCHEMA = _joi["default"].object({
  // Người nhận thông báo
  userId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  type: (_Joi$string$required = _joi["default"].string().required()).valid.apply(_Joi$string$required, (0, _toConsumableArray2["default"])(Object.values(_constants.NOTIFICATION_TYPES))),
  // Nội dung đã render sẵn để FE hiển thị thẳng
  message: _joi["default"].string().required(),
  // Ngữ cảnh (để điều hướng khi click) — đều optional
  actorId: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE).allow(null)["default"](null),
  workspaceId: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE).allow(null)["default"](null),
  boardId: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE).allow(null)["default"](null),
  isRead: _joi["default"]["boolean"]()["default"](false),
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
  // Mốc hết hạn (BSON Date) — TTL index tự xoá notification khi qua mốc này
  expireAt: _joi["default"].date()["default"](function () {
    return new Date(Date.now() + NOTIFICATION_TTL_MS);
  }),
  _destroy: _joi["default"]["boolean"]()["default"](false)
});
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, {
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

// Tạo 1 notification, trả về document đầy đủ (để controller emit qua socket)
var createNew = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
    var validData, insertData, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          insertData = _objectSpread(_objectSpread({}, validData), {}, {
            userId: new _mongodb.ObjectId(validData.userId),
            actorId: validData.actorId ? new _mongodb.ObjectId(validData.actorId) : null,
            workspaceId: validData.workspaceId ? new _mongodb.ObjectId(validData.workspaceId) : null,
            boardId: validData.boardId ? new _mongodb.ObjectId(validData.boardId) : null
          });
          _context2.next = 7;
          return (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME).insertOne(insertData);
        case 7:
          result = _context2.sent;
          _context2.next = 10;
          return (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME).findOne({
            _id: result.insertedId
          });
        case 10:
          return _context2.abrupt("return", _context2.sent);
        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 16:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 13]]);
  }));
  return function createNew(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

// Tạo nhiều notification trong 1 lệnh insertMany (fan-out @all / board đông người)
var createMany = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(dataList) {
    var validList, insertData, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          if (!(!Array.isArray(dataList) || dataList.length === 0)) {
            _context3.next = 3;
            break;
          }
          return _context3.abrupt("return", []);
        case 3:
          _context3.next = 5;
          return Promise.all(dataList.map(function (d) {
            return validateBeforeCreate(d);
          }));
        case 5:
          validList = _context3.sent;
          insertData = validList.map(function (v) {
            return _objectSpread(_objectSpread({}, v), {}, {
              userId: new _mongodb.ObjectId(v.userId),
              actorId: v.actorId ? new _mongodb.ObjectId(v.actorId) : null,
              workspaceId: v.workspaceId ? new _mongodb.ObjectId(v.workspaceId) : null,
              boardId: v.boardId ? new _mongodb.ObjectId(v.boardId) : null
            });
          });
          _context3.next = 9;
          return (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME).insertMany(insertData);
        case 9:
          result = _context3.sent;
          return _context3.abrupt("return", insertData.map(function (doc, idx) {
            return _objectSpread(_objectSpread({}, doc), {}, {
              _id: result.insertedIds[idx]
            });
          }));
        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          throw new Error(_context3.t0);
        case 16:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 13]]);
  }));
  return function createMany(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

// Lấy các thông báo gần nhất của 1 user
var findByUser = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(userId) {
    var limit,
      results,
      _args4 = arguments;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          limit = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 20;
          _context4.prev = 1;
          _context4.next = 4;
          return (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME).find({
            userId: new _mongodb.ObjectId(userId),
            _destroy: false
          }).sort({
            createdAt: -1
          }).limit(limit).toArray();
        case 4:
          results = _context4.sent;
          return _context4.abrupt("return", results);
        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](1);
          throw new Error(_context4.t0);
        case 11:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[1, 8]]);
  }));
  return function findByUser(_x4) {
    return _ref4.apply(this, arguments);
  };
}();
var countUnread = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(userId) {
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME).countDocuments({
            userId: new _mongodb.ObjectId(userId),
            isRead: false,
            _destroy: false
          });
        case 3:
          return _context5.abrupt("return", _context5.sent);
        case 6:
          _context5.prev = 6;
          _context5.t0 = _context5["catch"](0);
          throw new Error(_context5.t0);
        case 9:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 6]]);
  }));
  return function countUnread(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

// Đánh dấu đã đọc 1 thông báo (chỉ khi đúng chủ sở hữu)
var markRead = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(notificationId, userId) {
    var result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(notificationId),
            userId: new _mongodb.ObjectId(userId)
          }, {
            $set: {
              isRead: true
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context6.sent;
          return _context6.abrupt("return", result);
        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          throw new Error(_context6.t0);
        case 10:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 7]]);
  }));
  return function markRead(_x6, _x7) {
    return _ref6.apply(this, arguments);
  };
}();
var markAllRead = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(userId) {
    var result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME).updateMany({
            userId: new _mongodb.ObjectId(userId),
            isRead: false,
            _destroy: false
          }, {
            $set: {
              isRead: true
            }
          });
        case 3:
          result = _context7.sent;
          return _context7.abrupt("return", result);
        case 7:
          _context7.prev = 7;
          _context7.t0 = _context7["catch"](0);
          throw new Error(_context7.t0);
        case 10:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 7]]);
  }));
  return function markAllRead(_x8) {
    return _ref7.apply(this, arguments);
  };
}();

// Xoá (ẩn) 1 notification của chính user — soft delete qua cờ _destroy
var softDelete = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(notificationId, userId) {
    var result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(notificationId),
            userId: new _mongodb.ObjectId(userId)
          }, {
            $set: {
              _destroy: true
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context8.sent;
          return _context8.abrupt("return", result);
        case 7:
          _context8.prev = 7;
          _context8.t0 = _context8["catch"](0);
          throw new Error(_context8.t0);
        case 10:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 7]]);
  }));
  return function softDelete(_x9, _x0) {
    return _ref8.apply(this, arguments);
  };
}();

// Tạo index (idempotent) — gọi 1 lần lúc khởi động server
var initIndexes = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9() {
    var collection;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          collection = (0, _mongodb2.GET_DB)().collection(NOTIFICATION_COLLECTION_NAME);
          _context9.next = 3;
          return Promise.all([
          // Liệt kê notification theo user, sort mới nhất trước
          collection.createIndex({
            userId: 1,
            createdAt: -1
          }),
          // Đếm chưa đọc / mark-all-read theo user + isRead
          collection.createIndex({
            userId: 1,
            isRead: 1
          }),
          // TTL: Mongo tự xoá document khi expireAt < hiện tại
          collection.createIndex({
            expireAt: 1
          }, {
            expireAfterSeconds: 0
          })]);
        case 3:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return function initIndexes() {
    return _ref9.apply(this, arguments);
  };
}();
var notificationModel = {
  NOTIFICATION_COLLECTION_NAME: NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA: NOTIFICATION_COLLECTION_SCHEMA,
  createNew: createNew,
  createMany: createMany,
  findByUser: findByUser,
  countUnread: countUnread,
  markRead: markRead,
  markAllRead: markAllRead,
  softDelete: softDelete,
  initIndexes: initIndexes
};
exports.notificationModel = notificationModel;