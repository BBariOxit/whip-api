"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boardModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _joi = _interopRequireDefault(require("joi"));
var _validators = require("../utils/validators");
var _mongodb = require("../config/mongodb");
var _mongodb2 = require("mongodb");
var _constants = require("../utils/constants");
var _columnModel = require("./columnModel");
var _cardModel = require("./cardModel");
var _algorithms = require("../utils/algorithms");
var _userModel = require("./userModel");
var _labelModel = require("./labelModel");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// define collection (name & schema)

var BOARD_COLLECTION_NAME = 'boards';
var BOARD_COLLECTION_SCHEMA = _joi["default"].object({
  title: _joi["default"].string().required().min(3).max(50).trim().strict(),
  slug: _joi["default"].string().required().min(3).trim().strict(),
  description: _joi["default"].string().required().min(3).max(256).trim().strict(),
  type: _joi["default"].string().valid(_constants.BOARD_TYPES.PUBLIC, _constants.BOARD_TYPES.PRIVATE, _constants.BOARD_TYPES.WORKSPACE_VISIBLE).required(),
  background: _joi["default"].object({
    type: _joi["default"].string().valid('gradient', 'solid', 'image').required(),
    color1: _joi["default"].string().required(),
    color2: _joi["default"].string().optional()
  })["default"]({
    type: 'gradient',
    color1: '#8a2387',
    color2: '#e94057'
  }),
  workspaceId: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE)["default"](null).allow(null),
  // admin của board
  ownerIds: _joi["default"].array().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))["default"]([]),
  // những thành viên của board
  memberIds: _joi["default"].array().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))["default"]([]),
  columnOrderIds: _joi["default"].array().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))["default"]([]),
  customFields: _joi["default"].array().items(_joi["default"].object({
    _id: _joi["default"].string().required(),
    name: _joi["default"].string().required().trim().strict(),
    type: _joi["default"].string().valid('text', 'number', 'checkbox', 'dropdown', 'date').required(),
    options: _joi["default"].array().items(_joi["default"].object({
      _id: _joi["default"].string().required(),
      text: _joi["default"].string().required().trim().strict(),
      color: _joi["default"].string().optional()
    }))["default"]([]),
    showOnFront: _joi["default"]["boolean"]()["default"](false)
  }))["default"]([]),
  isTemplate: _joi["default"]["boolean"]()["default"](false),
  createAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
  updateAt: _joi["default"].date().timestamp('javascript')["default"](null),
  _destroy: _joi["default"]["boolean"]()["default"](false)
});

// chỉ định ra những field mà chúng ta ko muốn cho phép cập nhật trong hàm update
var INVALID_UPDATE_FIELDS = ['_id', 'createdAt'];
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return BOARD_COLLECTION_SCHEMA.validateAsync(data, {
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
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(userId, data) {
    var validData, newBoardToAdd, createdBoard;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          newBoardToAdd = _objectSpread(_objectSpread({}, validData), {}, {
            ownerIds: [new _mongodb2.ObjectId(userId)]
          });
          if (newBoardToAdd.workspaceId) {
            newBoardToAdd.workspaceId = new _mongodb2.ObjectId(newBoardToAdd.workspaceId);
          }
          _context2.next = 8;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd);
        case 8:
          createdBoard = _context2.sent;
          return _context2.abrupt("return", createdBoard);
        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 15:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 12]]);
  }));
  return function createNew(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();
var findOneById = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(boardId)
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
  return function findOneById(_x4) {
    return _ref3.apply(this, arguments);
  };
}();

// query tổng hợp (aggregate) để lấy tonaf bộ columns và cards thuộc về board
var getDetails = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(userId, boardId) {
    var queryConditions, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          queryConditions = [{
            _id: new _mongodb2.ObjectId(boardId)
          }, {
            _destroy: false
          }];
          _context4.next = 4;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).aggregate([{
            $match: {
              $and: queryConditions
            }
          }, {
            $lookup: {
              from: _columnModel.columnModel.COLUMN_COLLECTION_NAME,
              localField: '_id',
              foreignField: 'boardId',
              as: 'columns',
              pipeline: [{
                $match: {
                  _destroy: false
                }
              }]
            }
          }, {
            $lookup: {
              from: _cardModel.cardModel.CARD_COLLECTION_NAME,
              localField: '_id',
              foreignField: 'boardId',
              as: 'cards',
              pipeline: [{
                $match: {
                  _destroy: false
                }
              }]
            }
          }, {
            $lookup: {
              from: _userModel.userModel.USER_COLLECTION_NAME,
              localField: 'ownerIds',
              foreignField: '_id',
              as: 'owners',
              // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
              // $project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
              pipeline: [{
                $project: {
                  'password': 0,
                  'verifyToken': 0
                }
              }]
            }
          }, {
            $lookup: {
              from: _userModel.userModel.USER_COLLECTION_NAME,
              localField: 'memberIds',
              foreignField: '_id',
              as: 'members',
              pipeline: [{
                $project: {
                  'password': 0,
                  'verifyToken': 0
                }
              }]
            }
          }, {
            $lookup: {
              from: _labelModel.labelModel.LABEL_COLLECTION_NAME,
              localField: '_id',
              foreignField: 'boardId',
              as: 'labels'
            }
          }, {
            $lookup: {
              from: 'workspaces',
              // workspaceModel.WORKSPACE_COLLECTION_NAME
              localField: 'workspaceId',
              foreignField: '_id',
              as: 'workspace'
            }
          },
          // unwind workspace to object instead of array (if workspace exists)
          {
            $unwind: {
              path: '$workspace',
              preserveNullAndEmptyArrays: true
            }
          },
          // lookup workspaceMembers
          {
            $lookup: {
              from: _userModel.userModel.USER_COLLECTION_NAME,
              localField: 'workspace.memberIds',
              foreignField: '_id',
              as: 'workspaceMembers',
              pipeline: [{
                $project: {
                  'password': 0,
                  'verifyToken': 0
                }
              }]
            }
          }]).toArray();
        case 4:
          result = _context4.sent;
          return _context4.abrupt("return", result[0] || null);
        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](0);
          throw new Error(_context4.t0);
        case 11:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 8]]);
  }));
  return function getDetails(_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}();

// cập nhập push 1 giá trị column id vào cuối mảng columnOrderIds
var pushColumnOrderIds = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(column) {
    var result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(column.boardId)
          }, {
            $push: {
              columnOrderIds: new _mongodb2.ObjectId(column._id)
            }
          }, {
            returnDocument: 'after'
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
  return function pushColumnOrderIds(_x7) {
    return _ref5.apply(this, arguments);
  };
}();

// Chèn 1 giá trị column id vào một vị trí chỉ định trong mảng columnOrderIds
var insertColumnIdAtIndex = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(boardId, columnId, targetIndex) {
    var result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(boardId)
          }, {
            $push: {
              columnOrderIds: {
                $each: [new _mongodb2.ObjectId(columnId)],
                $position: targetIndex
              }
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
  return function insertColumnIdAtIndex(_x8, _x9, _x0) {
    return _ref6.apply(this, arguments);
  };
}();

// Lấy một phần tử columnId ra khỏi mảng columnOrderIds
// Dùng $pull trong mongodb ở trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
var pullColumnOrderIds = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(column) {
    var result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(column.boardId)
          }, {
            $pull: {
              columnOrderIds: new _mongodb2.ObjectId(column._id)
            }
          }, {
            returnDocument: 'after'
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
  return function pullColumnOrderIds(_x1) {
    return _ref7.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(boardId, updateData) {
    var result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          // lọc những cái field mà chúng ta ko cho phép cập nhật linh tinh
          Object.keys(updateData).forEach(function (fieldName) {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
              delete updateData(fieldName);
            }
          });

          // đối với những dữ liệu liên quan tới ObjectId, biến đổi ở đây
          if (updateData.columnOrderIds) {
            updateData.columnOrderIds = updateData.columnOrderIds.map(function (_id) {
              return new _mongodb2.ObjectId(_id);
            });
          }
          if (updateData.workspaceId !== undefined) {
            if (updateData.workspaceId && updateData.workspaceId !== 'null') {
              updateData.workspaceId = new _mongodb2.ObjectId(updateData.workspaceId);
            } else {
              updateData.workspaceId = null;
            }
          }
          _context8.next = 6;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(boardId)
          }, {
            $set: updateData
          }, {
            returnDocument: 'after'
          } // trả về kq mới sau khi cập nhật
          );
        case 6:
          result = _context8.sent;
          return _context8.abrupt("return", result);
        case 10:
          _context8.prev = 10;
          _context8.t0 = _context8["catch"](0);
          throw new Error(_context8.t0);
        case 13:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 10]]);
  }));
  return function update(_x10, _x11) {
    return _ref8.apply(this, arguments);
  };
}();
var getBoards = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(userId, page, itemsPerPage, queryFilters) {
    var _res$queryTotalBoards, queryConditions, query, res;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          queryConditions = [
          // điều kiện 1: board chưa bị xóa
          {
            _destroy: false
          },
          // Điều kiện 02: không phải là template
          {
            isTemplate: {
              $ne: true
            }
          },
          // Điều kiện 03: cái thằng userId đang thực hiện request này nó phải thuộc
          // vào một trong 2 cái mảng ownerIds hoặc memberIds, sử dụng toán tử $all của mongodb
          {
            $or: [{
              ownerIds: {
                $all: [new _mongodb2.ObjectId(userId)]
              }
            }, {
              memberIds: {
                $all: [new _mongodb2.ObjectId(userId)]
              }
            }]
          }]; // xử lý query filter cho từng trường hợp search board
          if (queryFilters) {
            Object.keys(queryFilters).forEach(function (key) {
              if (key === 'workspaceId') {
                if (queryFilters[key] && queryFilters[key] !== 'null') {
                  queryConditions.push({
                    workspaceId: new _mongodb2.ObjectId(queryFilters[key])
                  });
                } else {
                  queryConditions.push({
                    workspaceId: null
                  });
                }
              } else {
                queryConditions.push((0, _defineProperty2["default"])({}, key, {
                  $regex: new RegExp(queryFilters[key], 'i')
                }));
              }
            });
          }
          _context9.next = 5;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).aggregate([{
            $match: {
              $and: queryConditions
            }
          }, {
            $sort: {
              title: 1
            }
          }, {
            $facet: {
              'queryBoards': [{
                $skip: (0, _algorithms.pagingSkipValue)(page, itemsPerPage)
              }, {
                $limit: itemsPerPage
              }],
              'queryTotalBoards': [{
                $count: 'countedAllBoards'
              }]
            }
          }], {
            collation: {
              locale: 'en'
            }
          }).toArray();
        case 5:
          query = _context9.sent;
          res = query[0];
          return _context9.abrupt("return", {
            boards: res.queryBoards || [],
            totalBoards: ((_res$queryTotalBoards = res.queryTotalBoards[0]) === null || _res$queryTotalBoards === void 0 ? void 0 : _res$queryTotalBoards.countedAllBoards) || 0
          });
        case 10:
          _context9.prev = 10;
          _context9.t0 = _context9["catch"](0);
          throw new Error(_context9.t0);
        case 13:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 10]]);
  }));
  return function getBoards(_x12, _x13, _x14, _x15) {
    return _ref9.apply(this, arguments);
  };
}();
var getTemplates = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0() {
    var result;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _context0.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).find({
            isTemplate: true,
            _destroy: false
          }).sort({
            title: 1
          }).collation({
            locale: 'en'
          }).toArray();
        case 3:
          result = _context0.sent;
          return _context0.abrupt("return", result);
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
  return function getTemplates() {
    return _ref0.apply(this, arguments);
  };
}();
var pushMemberIds = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(boardId, userId) {
    var result;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          _context1.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(boardId)
          }, {
            $push: {
              memberIds: new _mongodb2.ObjectId(userId)
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context1.sent;
          return _context1.abrupt("return", result);
        case 7:
          _context1.prev = 7;
          _context1.t0 = _context1["catch"](0);
          throw new Error(_context1.t0);
        case 10:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[0, 7]]);
  }));
  return function pushMemberIds(_x16, _x17) {
    return _ref1.apply(this, arguments);
  };
}();
var pushCustomField = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(boardId, customField) {
    var result;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _context10.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(boardId)
          }, {
            $push: {
              customFields: customField
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context10.sent;
          return _context10.abrupt("return", result);
        case 7:
          _context10.prev = 7;
          _context10.t0 = _context10["catch"](0);
          throw new Error(_context10.t0);
        case 10:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 7]]);
  }));
  return function pushCustomField(_x18, _x19) {
    return _ref10.apply(this, arguments);
  };
}();
var updateCustomField = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(boardId, fieldId, updateData) {
    var setConditions, result;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          setConditions = {};
          if (updateData.name !== undefined) setConditions['customFields.$[elem].name'] = updateData.name;
          if (updateData.options !== undefined) setConditions['customFields.$[elem].options'] = updateData.options;
          if (updateData.showOnFront !== undefined) setConditions['customFields.$[elem].showOnFront'] = updateData.showOnFront;
          _context11.next = 7;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(boardId)
          }, {
            $set: setConditions
          }, {
            arrayFilters: [{
              'elem._id': fieldId
            }],
            returnDocument: 'after'
          });
        case 7:
          result = _context11.sent;
          return _context11.abrupt("return", result);
        case 11:
          _context11.prev = 11;
          _context11.t0 = _context11["catch"](0);
          throw new Error(_context11.t0);
        case 14:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 11]]);
  }));
  return function updateCustomField(_x20, _x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}();
var pullCustomField = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee12(boardId, fieldId) {
    var result;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          _context12.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(boardId)
          }, {
            $pull: {
              customFields: {
                _id: fieldId
              }
            }
          }, {
            returnDocument: 'after'
          });
        case 3:
          result = _context12.sent;
          return _context12.abrupt("return", result);
        case 7:
          _context12.prev = 7;
          _context12.t0 = _context12["catch"](0);
          throw new Error(_context12.t0);
        case 10:
        case "end":
          return _context12.stop();
      }
    }, _callee12, null, [[0, 7]]);
  }));
  return function pullCustomField(_x23, _x24) {
    return _ref12.apply(this, arguments);
  };
}();
var deleteOneById = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee13(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          _context13.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).deleteOne({
            _id: new _mongodb2.ObjectId(boardId)
          });
        case 3:
          result = _context13.sent;
          return _context13.abrupt("return", result);
        case 7:
          _context13.prev = 7;
          _context13.t0 = _context13["catch"](0);
          throw new Error(_context13.t0);
        case 10:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[0, 7]]);
  }));
  return function deleteOneById(_x25) {
    return _ref13.apply(this, arguments);
  };
}();
var findByWorkspaceId = /*#__PURE__*/function () {
  var _ref14 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee14(workspaceId) {
    var results;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          _context14.prev = 0;
          _context14.next = 3;
          return (0, _mongodb.GET_DB)().collection(BOARD_COLLECTION_NAME).find({
            workspaceId: new _mongodb2.ObjectId(workspaceId),
            _destroy: false
          }).toArray();
        case 3:
          results = _context14.sent;
          return _context14.abrupt("return", results);
        case 7:
          _context14.prev = 7;
          _context14.t0 = _context14["catch"](0);
          throw new Error(_context14.t0);
        case 10:
        case "end":
          return _context14.stop();
      }
    }, _callee14, null, [[0, 7]]);
  }));
  return function findByWorkspaceId(_x26) {
    return _ref14.apply(this, arguments);
  };
}();
var boardModel = {
  BOARD_COLLECTION_NAME: BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA: BOARD_COLLECTION_SCHEMA,
  createNew: createNew,
  findOneById: findOneById,
  getDetails: getDetails,
  pushColumnOrderIds: pushColumnOrderIds,
  insertColumnIdAtIndex: insertColumnIdAtIndex,
  update: update,
  pullColumnOrderIds: pullColumnOrderIds,
  getBoards: getBoards,
  getTemplates: getTemplates,
  pushMemberIds: pushMemberIds,
  pushCustomField: pushCustomField,
  updateCustomField: updateCustomField,
  pullCustomField: pullCustomField,
  deleteOneById: deleteOneById,
  findByWorkspaceId: findByWorkspaceId
};
exports.boardModel = boardModel;