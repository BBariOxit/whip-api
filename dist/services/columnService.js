"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.columnService = void 0;
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _boardModel = require("../models/boardModel");
var _columnModel = require("../models/columnModel");
var _cardModel = require("../models/cardModel");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _httpStatusCodes = require("http-status-codes");
var _mongodb = require("../config/mongodb");
var _mongodb2 = require("mongodb");
var _excluded = ["comments"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(reqBody) {
    var newColumn, createdColumn, getNewColumn;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          newColumn = _objectSpread({}, reqBody);
          _context.next = 4;
          return _columnModel.columnModel.createNew(newColumn);
        case 4:
          createdColumn = _context.sent;
          _context.next = 7;
          return _columnModel.columnModel.findOneById(createdColumn.insertedId);
        case 7:
          getNewColumn = _context.sent;
          if (!getNewColumn) {
            _context.next = 12;
            break;
          }
          getNewColumn.cards = [];
          // cập nhập lại mảng columnOrderIds trong collection board
          _context.next = 12;
          return _boardModel.boardModel.pushColumnOrderIds(getNewColumn);
        case 12:
          return _context.abrupt("return", getNewColumn);
        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          throw _context.t0;
        case 18:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 15]]);
  }));
  return function createNew(_x) {
    return _ref.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(columnId, reqBody) {
    var updateData, updatedColumn;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          updateData = _objectSpread(_objectSpread({}, reqBody), {}, {
            updatedAt: Date.now()
          });
          _context2.next = 4;
          return _columnModel.columnModel.update(columnId, updateData);
        case 4:
          updatedColumn = _context2.sent;
          return _context2.abrupt("return", updatedColumn);
        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;
        case 11:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 8]]);
  }));
  return function update(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(columnId) {
    var targetColumn;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return _columnModel.columnModel.findOneById(columnId);
        case 3:
          targetColumn = _context3.sent;
          if (targetColumn) {
            _context3.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'board not found!');
        case 6:
          _context3.next = 8;
          return _columnModel.columnModel.deleteOneById(columnId);
        case 8:
          _context3.next = 10;
          return _cardModel.cardModel.deleteManyByColumnId(columnId);
        case 10:
          _context3.next = 12;
          return _boardModel.boardModel.pullColumnOrderIds(targetColumn);
        case 12:
          return _context3.abrupt("return", {
            deleteResult: 'Column and its Cards deleted successfully!'
          });
        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](0);
          throw _context3.t0;
        case 18:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 15]]);
  }));
  return function deleteItem(_x4) {
    return _ref3.apply(this, arguments);
  };
}();
var clearAllCards = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(columnId) {
    var targetColumn;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return _columnModel.columnModel.findOneById(columnId);
        case 3:
          targetColumn = _context4.sent;
          if (targetColumn) {
            _context4.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'column not found!');
        case 6:
          _context4.next = 8;
          return _cardModel.cardModel.deleteManyByColumnId(columnId);
        case 8:
          _context4.next = 10;
          return _columnModel.columnModel.emptyCardOrderIds(columnId);
        case 10:
          return _context4.abrupt("return", {
            deleteResult: 'All cards in column deleted successfully!'
          });
        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4["catch"](0);
          throw _context4.t0;
        case 16:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 13]]);
  }));
  return function clearAllCards(_x5) {
    return _ref4.apply(this, arguments);
  };
}();
var updateAllCardsLayout = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(columnId, newLayout) {
    var targetColumn, result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return _columnModel.columnModel.findOneById(columnId);
        case 3:
          targetColumn = _context5.sent;
          if (targetColumn) {
            _context5.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'column not found!');
        case 6:
          _context5.next = 8;
          return _cardModel.cardModel.updateManyCardsLayoutByColumnId(columnId, newLayout);
        case 8:
          result = _context5.sent;
          return _context5.abrupt("return", {
            updatedCount: result.modifiedCount,
            message: "Successfully updated layout for ".concat(result.modifiedCount, " cards!")
          });
        case 12:
          _context5.prev = 12;
          _context5.t0 = _context5["catch"](0);
          throw _context5.t0;
        case 15:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 12]]);
  }));
  return function updateAllCardsLayout(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();
var archiveColumn = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(columnId) {
    var targetColumn;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return _columnModel.columnModel.findOneById(columnId);
        case 3:
          targetColumn = _context6.sent;
          if (targetColumn) {
            _context6.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Column not found!');
        case 6:
          _context6.next = 8;
          return _columnModel.columnModel.archiveColumn(columnId);
        case 8:
          _context6.next = 10;
          return _boardModel.boardModel.pullColumnOrderIds(targetColumn);
        case 10:
          return _context6.abrupt("return", {
            archiveResult: 'Column and its cards archived successfully!'
          });
        case 13:
          _context6.prev = 13;
          _context6.t0 = _context6["catch"](0);
          throw _context6.t0;
        case 16:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 13]]);
  }));
  return function archiveColumn(_x8) {
    return _ref6.apply(this, arguments);
  };
}();
var restoreColumn = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(columnId) {
    var targetColumn, restoredColumn;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return _columnModel.columnModel.findOneById(columnId);
        case 3:
          targetColumn = _context7.sent;
          if (targetColumn) {
            _context7.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Column not found!');
        case 6:
          _context7.next = 8;
          return _columnModel.columnModel.restoreColumn(columnId);
        case 8:
          restoredColumn = _context7.sent;
          _context7.next = 11;
          return _boardModel.boardModel.pushColumnOrderIds(targetColumn);
        case 11:
          return _context7.abrupt("return", restoredColumn);
        case 14:
          _context7.prev = 14;
          _context7.t0 = _context7["catch"](0);
          throw _context7.t0;
        case 17:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 14]]);
  }));
  return function restoreColumn(_x9) {
    return _ref7.apply(this, arguments);
  };
}();
var saveAsTemplate = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(columnId) {
    var result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return _columnModel.columnModel.saveAsTemplate(columnId);
        case 3:
          result = _context8.sent;
          return _context8.abrupt("return", result);
        case 7:
          _context8.prev = 7;
          _context8.t0 = _context8["catch"](0);
          throw _context8.t0;
        case 10:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 7]]);
  }));
  return function saveAsTemplate(_x0) {
    return _ref8.apply(this, arguments);
  };
}();
var getColumnTemplatesByBoardId = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(boardId) {
    var result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return _columnModel.columnModel.getTemplatesByBoardId(boardId);
        case 3:
          result = _context9.sent;
          return _context9.abrupt("return", result);
        case 7:
          _context9.prev = 7;
          _context9.t0 = _context9["catch"](0);
          throw _context9.t0;
        case 10:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 7]]);
  }));
  return function getColumnTemplatesByBoardId(_x1) {
    return _ref9.apply(this, arguments);
  };
}();
var useColumnTemplate = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(templateId, boardId) {
    var newColumn, fullColumn, db, result;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _context0.next = 3;
          return _columnModel.columnModel.useTemplate(templateId, boardId);
        case 3:
          newColumn = _context0.sent;
          if (!newColumn) {
            _context0.next = 7;
            break;
          }
          _context0.next = 7;
          return _boardModel.boardModel.pushColumnOrderIds(newColumn);
        case 7:
          _context0.next = 9;
          return _columnModel.columnModel.getTemplatesByBoardId(boardId);
        case 9:
          fullColumn = _context0.sent;
          // wait, getTemplatesByBoardId chỉ fetch templates.
          // get lại column bình thường
          db = require("../config/mongodb").GET_DB();
          _context0.next = 13;
          return db.collection(_columnModel.columnModel.COLUMN_COLLECTION_NAME).aggregate([{
            $match: {
              _id: newColumn._id
            }
          }, {
            $lookup: {
              from: 'cards',
              localField: '_id',
              foreignField: 'columnId',
              as: 'cards'
            }
          }]).toArray();
        case 13:
          result = _context0.sent;
          return _context0.abrupt("return", result[0] || newColumn);
        case 17:
          _context0.prev = 17;
          _context0.t0 = _context0["catch"](0);
          throw _context0.t0;
        case 20:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 17]]);
  }));
  return function useColumnTemplate(_x10, _x11) {
    return _ref0.apply(this, arguments);
  };
}();
var deleteColumnTemplate = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(templateId) {
    var result;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          _context1.next = 3;
          return (0, _mongodb.GET_DB)().collection(_columnModel.columnModel.COLUMN_COLLECTION_NAME).deleteOne({
            _id: new _mongodb2.ObjectId(templateId)
          });
        case 3:
          result = _context1.sent;
          return _context1.abrupt("return", result);
        case 7:
          _context1.prev = 7;
          _context1.t0 = _context1["catch"](0);
          throw _context1.t0;
        case 10:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[0, 7]]);
  }));
  return function deleteColumnTemplate(_x12) {
    return _ref1.apply(this, arguments);
  };
}();
var duplicateColumn = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(reqBody) {
    var columnId, boardId, targetIndex, db, originalColumn, originalCards, newColumnId, newCardOrderIds, newCardsToInsert, newColumnData;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          columnId = reqBody.columnId, boardId = reqBody.boardId, targetIndex = reqBody.targetIndex;
          db = (0, _mongodb.GET_DB)();
          _context10.next = 5;
          return db.collection(_columnModel.columnModel.COLUMN_COLLECTION_NAME).findOne({
            _id: new _mongodb2.ObjectId(columnId)
          });
        case 5:
          originalColumn = _context10.sent;
          if (originalColumn) {
            _context10.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Column not found!');
        case 8:
          _context10.next = 10;
          return db.collection(_cardModel.cardModel.CARD_COLLECTION_NAME).find({
            columnId: new _mongodb2.ObjectId(columnId)
          }).toArray();
        case 10:
          originalCards = _context10.sent;
          newColumnId = new _mongodb2.ObjectId();
          newCardOrderIds = [];
          newCardsToInsert = [];
          if (originalColumn.cardOrderIds && originalColumn.cardOrderIds.length > 0) {
            originalColumn.cardOrderIds.forEach(function (oldCardId) {
              var cardData = originalCards.find(function (c) {
                return c._id.toString() === oldCardId.toString();
              });
              if (cardData) {
                var newCardId = new _mongodb2.ObjectId();
                newCardOrderIds.push(newCardId);

                // 1. Loại bỏ các dữ liệu rác không cần copy
                var comments = cardData.comments,
                  cardWithoutComments = (0, _objectWithoutProperties2["default"])(cardData, _excluded);

                // 2. Reset lại tiến độ các Checklists về 0 và cấp lại ID mới
                var resetChecklists = [];
                if (cardWithoutComments.checklists && cardWithoutComments.checklists.length > 0) {
                  resetChecklists = cardWithoutComments.checklists.map(function (cl) {
                    var _cl$items;
                    return _objectSpread(_objectSpread({}, cl), {}, {
                      _id: new _mongodb2.ObjectId().toString(),
                      items: ((_cl$items = cl.items) === null || _cl$items === void 0 ? void 0 : _cl$items.map(function (item) {
                        return _objectSpread(_objectSpread({}, item), {}, {
                          _id: new _mongodb2.ObjectId().toString(),
                          isCompleted: false
                        });
                      })) || []
                    });
                  });
                }

                // 3. Giữ nguyên Attachments (Schema không dùng _id cho attachments nên copy thẳng)
                var copiedAttachments = cardWithoutComments.attachments || [];
                newCardsToInsert.push(_objectSpread(_objectSpread({}, cardWithoutComments), {}, {
                  _id: newCardId,
                  columnId: newColumnId,
                  checklists: resetChecklists,
                  attachments: copiedAttachments,
                  isTemplate: false,
                  totalComments: 0,
                  // Đảm bảo xóa đếm comments
                  createdAt: Date.now(),
                  updatedAt: null
                }));
              }
            });
          }
          newColumnData = _objectSpread(_objectSpread({}, originalColumn), {}, {
            _id: newColumnId,
            title: "".concat(originalColumn.title, " (Copy)"),
            cardOrderIds: newCardOrderIds,
            createdAt: Date.now(),
            updatedAt: null
          });
          _context10.next = 18;
          return db.collection(_columnModel.columnModel.COLUMN_COLLECTION_NAME).insertOne(newColumnData);
        case 18:
          if (!(newCardsToInsert.length > 0)) {
            _context10.next = 21;
            break;
          }
          _context10.next = 21;
          return db.collection(_cardModel.cardModel.CARD_COLLECTION_NAME).insertMany(newCardsToInsert);
        case 21:
          _context10.next = 23;
          return _boardModel.boardModel.insertColumnIdAtIndex(boardId, newColumnId.toString(), targetIndex);
        case 23:
          return _context10.abrupt("return", _objectSpread(_objectSpread({}, newColumnData), {}, {
            cards: newCardsToInsert
          }));
        case 26:
          _context10.prev = 26;
          _context10.t0 = _context10["catch"](0);
          throw _context10.t0;
        case 29:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 26]]);
  }));
  return function duplicateColumn(_x13) {
    return _ref10.apply(this, arguments);
  };
}();
var columnService = {
  createNew: createNew,
  update: update,
  deleteItem: deleteItem,
  clearAllCards: clearAllCards,
  updateAllCardsLayout: updateAllCardsLayout,
  archiveColumn: archiveColumn,
  restoreColumn: restoreColumn,
  saveAsTemplate: saveAsTemplate,
  getColumnTemplatesByBoardId: getColumnTemplatesByBoardId,
  useColumnTemplate: useColumnTemplate,
  deleteColumnTemplate: deleteColumnTemplate,
  duplicateColumn: duplicateColumn
};
exports.columnService = columnService;