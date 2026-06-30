"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _joi = _interopRequireDefault(require("joi"));
var _mongodb = require("../config/mongodb");
var _mongodb2 = require("mongodb");
var _validators = require("../utils/validators");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// Define Collection (name & schema)
var COMMENT_COLLECTION_NAME = 'comments';
var COMMENT_COLLECTION_SCHEMA = _joi["default"].object({
  cardId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  userId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  userEmail: _joi["default"].string().required(),
  userAvatar: _joi["default"].string().allow(null)["default"](null),
  userDisplayName: _joi["default"].string().required(),
  content: _joi["default"].string().required(),
  // Trỏ về comment gốc nếu đây là một reply
  parentId: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE).allow(null)["default"](null),
  // Tag tên người bị reply (Hệ phái 2)
  replyToUserDisplayName: _joi["default"].string().allow(null)["default"](null),
  // Tổng số lượt phản hồi cho comment này
  replyCount: _joi["default"].number()["default"](0),
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
  updatedAt: _joi["default"].date().timestamp('javascript')["default"](null),
  _destroy: _joi["default"]["boolean"]()["default"](false)
});
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return COMMENT_COLLECTION_SCHEMA.validateAsync(data, {
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
    var validData, newComment, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          newComment = _objectSpread(_objectSpread({}, validData), {}, {
            cardId: new _mongodb2.ObjectId(validData.cardId),
            userId: new _mongodb2.ObjectId(validData.userId),
            parentId: validData.parentId ? new _mongodb2.ObjectId(validData.parentId) : null
          });
          _context2.next = 7;
          return (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).insertOne(newComment);
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
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(commentId) {
    var result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(commentId)
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
var getCommentsByCardId = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(cardId) {
    var page,
      limit,
      skip,
      query,
      _yield$Promise$all,
      _yield$Promise$all2,
      comments,
      total,
      _args4 = arguments;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          page = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 1;
          limit = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : 10;
          _context4.prev = 2;
          skip = (page - 1) * limit;
          query = {
            cardId: new _mongodb2.ObjectId(cardId),
            parentId: null
          }; // Chỉ lấy comment gốc
          _context4.next = 7;
          return Promise.all([(0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).find(query).sort({
            createdAt: -1
          }) // Comment mới nhất lên đầu
          .skip(skip).limit(limit).toArray(), (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).countDocuments(query)]);
        case 7:
          _yield$Promise$all = _context4.sent;
          _yield$Promise$all2 = (0, _slicedToArray2["default"])(_yield$Promise$all, 2);
          comments = _yield$Promise$all2[0];
          total = _yield$Promise$all2[1];
          return _context4.abrupt("return", {
            comments: comments,
            total: total
          });
        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](2);
          throw new Error(_context4.t0);
        case 17:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[2, 14]]);
  }));
  return function getCommentsByCardId(_x4) {
    return _ref4.apply(this, arguments);
  };
}();
var getRepliesByParentId = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(parentId) {
    var page,
      limit,
      skip,
      query,
      _yield$Promise$all3,
      _yield$Promise$all4,
      comments,
      total,
      _args5 = arguments;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          page = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : 1;
          limit = _args5.length > 2 && _args5[2] !== undefined ? _args5[2] : 10;
          _context5.prev = 2;
          skip = (page - 1) * limit;
          query = {
            parentId: new _mongodb2.ObjectId(parentId)
          };
          _context5.next = 7;
          return Promise.all([(0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).find(query).sort({
            createdAt: 1
          }) // Reply thì cũ lên đầu (như youtube)
          .skip(skip).limit(limit).toArray(), (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).countDocuments(query)]);
        case 7:
          _yield$Promise$all3 = _context5.sent;
          _yield$Promise$all4 = (0, _slicedToArray2["default"])(_yield$Promise$all3, 2);
          comments = _yield$Promise$all4[0];
          total = _yield$Promise$all4[1];
          return _context5.abrupt("return", {
            comments: comments,
            total: total
          });
        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](2);
          throw new Error(_context5.t0);
        case 17:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[2, 14]]);
  }));
  return function getRepliesByParentId(_x5) {
    return _ref5.apply(this, arguments);
  };
}();
var incrementReplyCount = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(commentId) {
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).updateOne({
            _id: new _mongodb2.ObjectId(commentId)
          }, {
            $inc: {
              replyCount: 1
            }
          });
        case 3:
          _context6.next = 8;
          break;
        case 5:
          _context6.prev = 5;
          _context6.t0 = _context6["catch"](0);
          throw new Error(_context6.t0);
        case 8:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 5]]);
  }));
  return function incrementReplyCount(_x6) {
    return _ref6.apply(this, arguments);
  };
}();
var decrementReplyCount = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(commentId) {
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).updateOne({
            _id: new _mongodb2.ObjectId(commentId)
          }, {
            $inc: {
              replyCount: -1
            }
          });
        case 3:
          _context7.next = 8;
          break;
        case 5:
          _context7.prev = 5;
          _context7.t0 = _context7["catch"](0);
          throw new Error(_context7.t0);
        case 8:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 5]]);
  }));
  return function decrementReplyCount(_x7) {
    return _ref7.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(commentId, updateData) {
    var result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(commentId)
          }, {
            $set: updateData
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
  return function update(_x8, _x9) {
    return _ref8.apply(this, arguments);
  };
}();
var deleteById = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(commentId) {
    var result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).deleteOne({
            _id: new _mongodb2.ObjectId(commentId)
          });
        case 3:
          result = _context9.sent;
          return _context9.abrupt("return", result);
        case 7:
          _context9.prev = 7;
          _context9.t0 = _context9["catch"](0);
          throw new Error(_context9.t0);
        case 10:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 7]]);
  }));
  return function deleteById(_x0) {
    return _ref9.apply(this, arguments);
  };
}();
var deleteManyByParentId = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(parentId) {
    var result;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _context0.next = 3;
          return (0, _mongodb.GET_DB)().collection(COMMENT_COLLECTION_NAME).deleteMany({
            parentId: new _mongodb2.ObjectId(parentId)
          });
        case 3:
          result = _context0.sent;
          return _context0.abrupt("return", result.deletedCount);
        case 7:
          _context0.prev = 7;
          _context0.t0 = _context0["catch"](0);
          throw new Error(_context0.t0);
        case 10:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 7]]);
  }));
  return function deleteManyByParentId(_x1) {
    return _ref0.apply(this, arguments);
  };
}();
var commentModel = {
  COMMENT_COLLECTION_NAME: COMMENT_COLLECTION_NAME,
  COMMENT_COLLECTION_SCHEMA: COMMENT_COLLECTION_SCHEMA,
  createNew: createNew,
  findOneById: findOneById,
  getCommentsByCardId: getCommentsByCardId,
  getRepliesByParentId: getRepliesByParentId,
  incrementReplyCount: incrementReplyCount,
  decrementReplyCount: decrementReplyCount,
  update: update,
  deleteById: deleteById,
  deleteManyByParentId: deleteManyByParentId
};
exports.commentModel = commentModel;