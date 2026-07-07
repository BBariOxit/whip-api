"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.columnModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _joi = _interopRequireDefault(require("joi"));
var _validators = require("../utils/validators");
var _mongodb = require("../config/mongodb");
var _mongodb2 = require("mongodb");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// Define Collection (name & schema)
var COLUMN_COLLECTION_NAME = 'columns';
var COLUMN_COLLECTION_SCHEMA = _joi["default"].object({
  boardId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  title: _joi["default"].string().required().min(3).max(50).trim().strict(),
  isTemplate: _joi["default"]["boolean"]()["default"](false),
  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn
  cardOrderIds: _joi["default"].array().items(_joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE))["default"]([]),
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
  updatedAt: _joi["default"].date().timestamp('javascript')["default"](null),
  _destroy: _joi["default"]["boolean"]()["default"](false)
});

// chỉ định ra những field mà chúng ta ko muốn cho phép cập nhật trong hàm update
var INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt', '_destroy', 'isTemplate'];
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return COLUMN_COLLECTION_SCHEMA.validateAsync(data, {
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
    var validData, newColumnToAdd, createdColumn;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          newColumnToAdd = _objectSpread(_objectSpread({}, validData), {}, {
            boardId: new _mongodb2.ObjectId(validData.boardId)
          });
          _context2.next = 7;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd);
        case 7:
          createdColumn = _context2.sent;
          return _context2.abrupt("return", createdColumn);
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
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(columnId)
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
var pushCardOrderIds = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(card) {
    var result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(card.columnId)
          }, {
            $push: {
              cardOrderIds: new _mongodb2.ObjectId(card._id)
            }
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
  return function pushCardOrderIds(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

// pull 1 giá trị card id ra khỏi mảng cardOrderIds
var pullCardOrderIds = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(card) {
    var result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(card.columnId)
          }, {
            $pull: {
              cardOrderIds: new _mongodb2.ObjectId(card._id)
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
  return function pullCardOrderIds(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

// làm rỗng mảng cardOrderIds
var emptyCardOrderIds = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(columnId)
          }, {
            $set: {
              cardOrderIds: []
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
  return function emptyCardOrderIds(_x6) {
    return _ref6.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(columnId, updateData) {
    var result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          // lọc những cái field mà chúng ta ko cho phép cập nhật linh tinh
          Object.keys(updateData).forEach(function (fieldName) {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
              delete updateData[fieldName];
            }
          });

          // đối với những dữ liệu liên quan tới ObjectId, biến đổi ở đây
          if (updateData.cardOrderIds) {
            updateData.cardOrderIds = updateData.cardOrderIds.map(function (_id) {
              return new _mongodb2.ObjectId(_id);
            });
          }
          _context7.next = 5;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(columnId)
          }, {
            $set: updateData
          }, {
            returnDocument: 'after'
          } // trả về kq mới sau khi cập nhật
          );
        case 5:
          result = _context7.sent;
          return _context7.abrupt("return", result);
        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          throw new Error(_context7.t0);
        case 12:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 9]]);
  }));
  return function update(_x7, _x8) {
    return _ref7.apply(this, arguments);
  };
}();
var deleteOneById = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).deleteOne({
            _id: new _mongodb2.ObjectId(columnId)
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
  return function deleteOneById(_x9) {
    return _ref8.apply(this, arguments);
  };
}();
var deleteManyByBoardId = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).deleteMany({
            boardId: new _mongodb2.ObjectId(boardId)
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
  return function deleteManyByBoardId(_x0) {
    return _ref9.apply(this, arguments);
  };
}();
var archiveColumn = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _context0.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(columnId)
          }, {
            $set: {
              _destroy: true,
              updatedAt: Date.now()
            }
          }, {
            returnDocument: 'after'
          });
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
  return function archiveColumn(_x1) {
    return _ref0.apply(this, arguments);
  };
}();
var getArchivedByBoardId = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          _context1.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).find({
            boardId: new _mongodb2.ObjectId(boardId),
            _destroy: true
          }).toArray();
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
  return function getArchivedByBoardId(_x10) {
    return _ref1.apply(this, arguments);
  };
}();
var restoreColumn = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _context10.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb2.ObjectId(columnId)
          }, {
            $set: {
              _destroy: false,
              updatedAt: Date.now()
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
  return function restoreColumn(_x11) {
    return _ref10.apply(this, arguments);
  };
}();
var saveAsTemplate = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(columnId) {
    var db, originalColumn, newColumnTemplate, createdColumn, newColumnId, cards, templateCardsToInsert, insertedCards, insertedCardIds;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          db = (0, _mongodb.GET_DB)();
          _context11.next = 4;
          return db.collection(COLUMN_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(columnId)
          });
        case 4:
          originalColumn = _context11.sent;
          if (originalColumn) {
            _context11.next = 7;
            break;
          }
          throw new Error('Column not found!');
        case 7:
          // 1. Create Column Template
          newColumnTemplate = {
            boardId: originalColumn.boardId,
            title: originalColumn.title,
            isTemplate: true,
            cardOrderIds: [],
            createdAt: Date.now(),
            updatedAt: null,
            _destroy: false
          };
          _context11.next = 10;
          return db.collection(COLUMN_COLLECTION_NAME).insertOne(newColumnTemplate);
        case 10:
          createdColumn = _context11.sent;
          newColumnId = createdColumn.insertedId; // 2. Fetch all active cards of the original column
          _context11.next = 14;
          return db.collection('cards').find({
            columnId: originalColumn._id,
            _destroy: false,
            isTemplate: {
              $ne: true
            } // exclude inner templates if any (handles missing field too)
          }).toArray();
        case 14:
          cards = _context11.sent;
          if (!(cards.length > 0)) {
            _context11.next = 23;
            break;
          }
          templateCardsToInsert = cards.map(function (card) {
            return {
              boardId: card.boardId,
              columnId: newColumnId,
              title: card.title,
              layout: card.layout || 'detailed',
              description: card.description || null,
              cover: card.cover || null,
              memberIds: card.memberIds || [],
              labelIds: card.labelIds || [],
              totalComments: 0,
              dueDate: null,
              dueComplete: false,
              checklists: (card.checklists || []).map(function (cl) {
                return _objectSpread(_objectSpread({}, cl), {}, {
                  _id: new _mongodb2.ObjectId().toString(),
                  items: (cl.items || []).map(function (item) {
                    return _objectSpread(_objectSpread({}, item), {}, {
                      _id: new _mongodb2.ObjectId().toString(),
                      isCompleted: false
                    });
                  })
                });
              }),
              attachments: card.attachments || [],
              customFieldValues: card.customFieldValues || [],
              isTemplate: true,
              _destroy: false,
              createdAt: Date.now(),
              updatedAt: null
            };
          });
          _context11.next = 19;
          return db.collection('cards').insertMany(templateCardsToInsert);
        case 19:
          insertedCards = _context11.sent;
          insertedCardIds = Object.values(insertedCards.insertedIds); // Update cardOrderIds of the new Column Template
          _context11.next = 23;
          return db.collection(COLUMN_COLLECTION_NAME).updateOne({
            _id: newColumnId
          }, {
            $set: {
              cardOrderIds: insertedCardIds
            }
          });
        case 23:
          _context11.next = 25;
          return db.collection(COLUMN_COLLECTION_NAME).findOne({
            _id: newColumnId
          });
        case 25:
          return _context11.abrupt("return", _context11.sent);
        case 28:
          _context11.prev = 28;
          _context11.t0 = _context11["catch"](0);
          throw new Error(_context11.t0);
        case 31:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 28]]);
  }));
  return function saveAsTemplate(_x12) {
    return _ref11.apply(this, arguments);
  };
}();
var getTemplatesByBoardId = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee12(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          _context12.next = 3;
          return (0, _mongodb.GET_DB)().collection(COLUMN_COLLECTION_NAME).aggregate([{
            $match: {
              boardId: new _mongodb2.ObjectId(boardId),
              isTemplate: true,
              _destroy: false
            }
          }, {
            $lookup: {
              from: 'cards',
              localField: '_id',
              foreignField: 'columnId',
              as: 'cards'
            }
          }]).toArray();
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
  return function getTemplatesByBoardId(_x13) {
    return _ref12.apply(this, arguments);
  };
}();
var useTemplate = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee13(templateId, boardId) {
    var db, templateColumn, newColumnData, createdColumn, newColumnId, templateCards, realCardsToInsert, insertedCards, insertedCardIds;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          db = (0, _mongodb.GET_DB)();
          _context13.next = 4;
          return db.collection(COLUMN_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(templateId),
            isTemplate: true
          });
        case 4:
          templateColumn = _context13.sent;
          if (templateColumn) {
            _context13.next = 7;
            break;
          }
          throw new Error('Column Template not found!');
        case 7:
          // 1. Create new Column
          newColumnData = {
            boardId: new _mongodb2.ObjectId(boardId),
            title: templateColumn.title,
            isTemplate: false,
            cardOrderIds: [],
            createdAt: Date.now(),
            updatedAt: null,
            _destroy: false
          };
          _context13.next = 10;
          return db.collection(COLUMN_COLLECTION_NAME).insertOne(newColumnData);
        case 10:
          createdColumn = _context13.sent;
          newColumnId = createdColumn.insertedId; // 2. Fetch all template cards inside this column template
          _context13.next = 14;
          return db.collection('cards').find({
            columnId: templateColumn._id,
            isTemplate: true,
            _destroy: false
          }).toArray();
        case 14:
          templateCards = _context13.sent;
          if (!(templateCards.length > 0)) {
            _context13.next = 23;
            break;
          }
          realCardsToInsert = templateCards.map(function (card) {
            return {
              boardId: new _mongodb2.ObjectId(boardId),
              columnId: newColumnId,
              title: card.title,
              layout: card.layout || 'detailed',
              description: card.description || null,
              cover: card.cover || null,
              memberIds: card.memberIds || [],
              labelIds: card.labelIds || [],
              totalComments: 0,
              dueDate: null,
              dueComplete: false,
              checklists: (card.checklists || []).map(function (cl) {
                return _objectSpread(_objectSpread({}, cl), {}, {
                  _id: new _mongodb2.ObjectId().toString(),
                  items: (cl.items || []).map(function (item) {
                    return _objectSpread(_objectSpread({}, item), {}, {
                      _id: new _mongodb2.ObjectId().toString(),
                      isCompleted: false
                    });
                  })
                });
              }),
              attachments: (card.attachments || []).map(function (att) {
                return _objectSpread(_objectSpread({}, att), {}, {
                  createdAt: Date.now()
                });
              }),
              customFieldValues: card.customFieldValues || [],
              isTemplate: false,
              _destroy: false,
              createdAt: Date.now(),
              updatedAt: null
            };
          });
          _context13.next = 19;
          return db.collection('cards').insertMany(realCardsToInsert);
        case 19:
          insertedCards = _context13.sent;
          insertedCardIds = Object.values(insertedCards.insertedIds); // Update cardOrderIds of the new Column
          _context13.next = 23;
          return db.collection(COLUMN_COLLECTION_NAME).updateOne({
            _id: newColumnId
          }, {
            $set: {
              cardOrderIds: insertedCardIds
            }
          });
        case 23:
          _context13.next = 25;
          return db.collection(COLUMN_COLLECTION_NAME).findOne({
            _id: newColumnId
          });
        case 25:
          return _context13.abrupt("return", _context13.sent);
        case 28:
          _context13.prev = 28;
          _context13.t0 = _context13["catch"](0);
          throw new Error(_context13.t0);
        case 31:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[0, 28]]);
  }));
  return function useTemplate(_x14, _x15) {
    return _ref13.apply(this, arguments);
  };
}();
var deleteTemplate = /*#__PURE__*/function () {
  var _ref14 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee14(templateId) {
    var db, result;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          _context14.prev = 0;
          db = (0, _mongodb.GET_DB)();
          _context14.next = 4;
          return db.collection(COLUMN_COLLECTION_NAME).deleteOne({
            _id: new _mongodb2.ObjectId(templateId),
            isTemplate: true
          });
        case 4:
          result = _context14.sent;
          if (!(result.deletedCount > 0)) {
            _context14.next = 8;
            break;
          }
          _context14.next = 8;
          return db.collection('cards').deleteMany({
            columnId: new _mongodb2.ObjectId(templateId),
            isTemplate: true
          });
        case 8:
          return _context14.abrupt("return", result);
        case 11:
          _context14.prev = 11;
          _context14.t0 = _context14["catch"](0);
          throw new Error(_context14.t0);
        case 14:
        case "end":
          return _context14.stop();
      }
    }, _callee14, null, [[0, 11]]);
  }));
  return function deleteTemplate(_x16) {
    return _ref14.apply(this, arguments);
  };
}();
var columnModel = {
  COLUMN_COLLECTION_NAME: COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA: COLUMN_COLLECTION_SCHEMA,
  createNew: createNew,
  findOneById: findOneById,
  pushCardOrderIds: pushCardOrderIds,
  update: update,
  deleteOneById: deleteOneById,
  deleteManyByBoardId: deleteManyByBoardId,
  pullCardOrderIds: pullCardOrderIds,
  emptyCardOrderIds: emptyCardOrderIds,
  archiveColumn: archiveColumn,
  getArchivedByBoardId: getArchivedByBoardId,
  restoreColumn: restoreColumn,
  saveAsTemplate: saveAsTemplate,
  getTemplatesByBoardId: getTemplatesByBoardId,
  useTemplate: useTemplate,
  deleteTemplate: deleteTemplate
};
exports.columnModel = columnModel;