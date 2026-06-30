"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boardService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _formatter = require("../utils/formatter");
var _boardModel = require("../models/boardModel");
var _columnModel = require("../models/columnModel");
var _cardModel = require("../models/cardModel");
var _labelModel = require("../models/labelModel");
var _mongodb = require("../config/mongodb");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _httpStatusCodes = require("http-status-codes");
var _validators = require("../utils/validators");
var _constants = require("../utils/constants");
var _mongodb2 = require("mongodb");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; } /* eslint-disable no-useless-catch */
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(userId, reqBody) {
    var newBoard, createdBoard, getNewBoard;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          // xử lý logic dữ liệu
          newBoard = _objectSpread(_objectSpread({}, reqBody), {}, {
            slug: (0, _formatter.slugify)(reqBody.title)
          }); // gọi tới tầng model để xử lý lưu bản ghi newBoard vào trong database
          _context.next = 4;
          return _boardModel.boardModel.createNew(userId, newBoard);
        case 4:
          createdBoard = _context.sent;
          _context.next = 7;
          return _boardModel.boardModel.findOneById(createdBoard.insertedId);
        case 7:
          getNewBoard = _context.sent;
          return _context.abrupt("return", getNewBoard);
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
  return function createNew(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var getDetails = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(userId, boardId) {
    var _board$ownerIds, _board$memberIds, board, isOwner, isMember, isAuthorized, resBoard;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          if (_validators.OBJECT_ID_RULE.test(boardId)) {
            _context2.next = 3;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Invalid board id');
        case 3:
          _context2.next = 5;
          return _boardModel.boardModel.getDetails(userId, boardId);
        case 5:
          board = _context2.sent;
          if (board) {
            _context2.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'board not found!');
        case 8:
          // 👑 CHỐT CHẶN BẢO MẬT (Gatekeeper)
          isOwner = userId && ((_board$ownerIds = board.ownerIds) === null || _board$ownerIds === void 0 ? void 0 : _board$ownerIds.some(function (id) {
            return id.toString() === userId;
          }));
          isMember = userId && ((_board$memberIds = board.memberIds) === null || _board$memberIds === void 0 ? void 0 : _board$memberIds.some(function (id) {
            return id.toString() === userId;
          }));
          isAuthorized = isOwner || isMember;
          if (!(board.type === 'private' && !isAuthorized)) {
            _context2.next = 13;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Access denied. You do not have permission to view this private board.');
        case 13:
          // // B1: structuredClone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu,
          // // tùy mục đích về sau mà có cần structuredClone hay không.
          // const resBoard = structuredClone(board)
          // // B2: đưa card về đúng column của nó
          // resBoard.columns.forEach(column => {
          //   column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
          // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals
          //   // column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
          // })
          // // B3: xóa mảng card khỏi board ban đầu
          // delete resBoard.cards
          // khi xài structuredClone, nó làm bay sạch method của ObjectId, gọi .toString() nó sẽ ra cái chuỗi "[object Object]" hoặc mớ hỗn độn nào đó
          // => ép kiểu toàn bộ Object về String trước khi filter, hoặc xài clone deep của lodash
          // B1: Dùng cách này để "String hóa" toàn bộ ObjectId một cách nhanh nhất
          resBoard = JSON.parse(JSON.stringify(board)); // B2: đưa card về đúng column của nó
          // bây giờ resBoard._id, column._id, card.columnId... ĐỀU LÀ STRING NGUYÊN BẢN
          resBoard.columns.forEach(function (column) {
            column.cards = resBoard.cards.filter(function (card) {
              return card.columnId === column._id;
            });
          });

          // B3: xóa mảng card khỏi board ban đầu
          delete resBoard.cards;
          return _context2.abrupt("return", resBoard);
        case 19:
          _context2.prev = 19;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;
        case 22:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 19]]);
  }));
  return function getDetails(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(boardId, reqBody) {
    var updateData, updatedBoard;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          updateData = _objectSpread(_objectSpread({}, reqBody), {}, {
            updatedAt: Date.now()
          });
          _context3.next = 4;
          return _boardModel.boardModel.update(boardId, updateData);
        case 4:
          updatedBoard = _context3.sent;
          return _context3.abrupt("return", updatedBoard);
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
  return function update(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var updateVisibility = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(userId, boardId, type) {
    var _board$ownerIds2, board, isOwner, updatedBoard;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return _boardModel.boardModel.findOneById(boardId);
        case 3:
          board = _context4.sent;
          if (board) {
            _context4.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Board not found!');
        case 6:
          isOwner = (_board$ownerIds2 = board.ownerIds) === null || _board$ownerIds2 === void 0 ? void 0 : _board$ownerIds2.some(function (id) {
            return id.toString() === userId;
          });
          if (isOwner) {
            _context4.next = 9;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Only owners can update board visibility!');
        case 9:
          _context4.next = 11;
          return _boardModel.boardModel.update(boardId, {
            type: type,
            updatedAt: Date.now()
          });
        case 11:
          updatedBoard = _context4.sent;
          return _context4.abrupt("return", updatedBoard);
        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](0);
          throw _context4.t0;
        case 18:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 15]]);
  }));
  return function updateVisibility(_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}();
var moveCardifferentColumn = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(reqBody) {
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return _columnModel.columnModel.update(reqBody.prevColumnId, {
            cardOrderIds: reqBody.prevCardOrderIds,
            updatedAt: Date.now()
          });
        case 3:
          _context5.next = 5;
          return _columnModel.columnModel.update(reqBody.nextColumnId, {
            cardOrderIds: reqBody.nexCardOrderIds,
            updatedAt: Date.now()
          });
        case 5:
          _context5.next = 7;
          return _cardModel.cardModel.update(reqBody.currCardId, {
            columnId: reqBody.nextColumnId
          });
        case 7:
          return _context5.abrupt("return", {
            updateResult: 'Sucessfully!'
          });
        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](0);
          throw _context5.t0;
        case 13:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 10]]);
  }));
  return function moveCardifferentColumn(_x0) {
    return _ref5.apply(this, arguments);
  };
}();
var getBoards = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(userId, page, itemsPerPage, queryFilters) {
    var results;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          if (!page) page = _constants.DEFAULT_PAGE;
          if (!itemsPerPage) itemsPerPage = _constants.DEFAULT_ITEMS_PER_PAGE;
          _context6.next = 5;
          return _boardModel.boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10), queryFilters);
        case 5:
          results = _context6.sent;
          return _context6.abrupt("return", results);
        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          throw _context6.t0;
        case 12:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 9]]);
  }));
  return function getBoards(_x1, _x10, _x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(boardId) {
    var targetBoard;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return _boardModel.boardModel.findOneById(boardId);
        case 3:
          targetBoard = _context7.sent;
          if (targetBoard) {
            _context7.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Board not found!');
        case 6:
          _context7.next = 8;
          return _boardModel.boardModel.deleteOneById(boardId);
        case 8:
          _context7.next = 10;
          return _columnModel.columnModel.deleteManyByBoardId(boardId);
        case 10:
          _context7.next = 12;
          return _cardModel.cardModel.deleteManyByBoardId(boardId);
        case 12:
          return _context7.abrupt("return", {
            deleteResult: 'Board and its Columns, Cards deleted successfully!'
          });
        case 15:
          _context7.prev = 15;
          _context7.t0 = _context7["catch"](0);
          throw _context7.t0;
        case 18:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 15]]);
  }));
  return function deleteItem(_x13) {
    return _ref7.apply(this, arguments);
  };
}();
var bulkDeleteItems = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(userId, boardIds) {
    var objectIds, db, boardsToDelete, validBoardIds;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          if (!(!boardIds || !Array.isArray(boardIds) || boardIds.length === 0)) {
            _context8.next = 3;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Board IDs array is empty');
        case 3:
          objectIds = boardIds.map(function (id) {
            return new _mongodb2.ObjectId(id);
          });
          db = (0, _mongodb.GET_DB)(); // Find boards that actually belong to the user and match the IDs
          _context8.next = 7;
          return db.collection(_boardModel.boardModel.BOARD_COLLECTION_NAME).find({
            _id: {
              $in: objectIds
            },
            ownerIds: {
              $all: [new _mongodb2.ObjectId(userId)]
            }
          }).toArray();
        case 7:
          boardsToDelete = _context8.sent;
          validBoardIds = boardsToDelete.map(function (b) {
            return b._id;
          });
          if (!(validBoardIds.length > 0)) {
            _context8.next = 18;
            break;
          }
          _context8.next = 12;
          return db.collection(_boardModel.boardModel.BOARD_COLLECTION_NAME).deleteMany({
            _id: {
              $in: validBoardIds
            }
          });
        case 12:
          _context8.next = 14;
          return db.collection(_columnModel.columnModel.COLUMN_COLLECTION_NAME).deleteMany({
            boardId: {
              $in: validBoardIds
            }
          });
        case 14:
          _context8.next = 16;
          return db.collection(_cardModel.cardModel.CARD_COLLECTION_NAME).deleteMany({
            boardId: {
              $in: validBoardIds
            }
          });
        case 16:
          _context8.next = 18;
          return db.collection(_labelModel.labelModel.LABEL_COLLECTION_NAME).deleteMany({
            boardId: {
              $in: validBoardIds
            }
          });
        case 18:
          return _context8.abrupt("return", {
            deleteResult: "Successfully deleted ".concat(validBoardIds.length, " boards!")
          });
        case 21:
          _context8.prev = 21;
          _context8.t0 = _context8["catch"](0);
          throw _context8.t0;
        case 24:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 21]]);
  }));
  return function bulkDeleteItems(_x14, _x15) {
    return _ref8.apply(this, arguments);
  };
}();
var getTemplates = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9() {
    var results;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return _boardModel.boardModel.getTemplates();
        case 3:
          results = _context9.sent;
          return _context9.abrupt("return", results);
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
  return function getTemplates() {
    return _ref9.apply(this, arguments);
  };
}();
var cloneTemplate = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(userId, templateBoardId) {
    var templateBoard, templateColumns, templateCards, templateLabels, newTitle, newBoardData, createdBoard, newBoardId, columnIdMapping, newColumnOrderIds, _iterator, _step, _col, newColData, createdCol, labelIdMapping, newLabelsData, _iterator2, _step2, label, newLabelId, newLabel, cardIdMapping, newCardsData, _iterator3, _step3, card, _newColId, newCardId, mappedLabelIds, newCard, orderedNewColIds, _iterator4, _step4, col, newColId, newCardOrderIds;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _context0.next = 3;
          return _boardModel.boardModel.findOneById(templateBoardId);
        case 3:
          templateBoard = _context0.sent;
          if (!(!templateBoard || !templateBoard.isTemplate)) {
            _context0.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Template not found!');
        case 6:
          _context0.next = 8;
          return (0, _mongodb.GET_DB)().collection(_columnModel.columnModel.COLUMN_COLLECTION_NAME).find({
            boardId: templateBoard._id
          }).toArray();
        case 8:
          templateColumns = _context0.sent;
          _context0.next = 11;
          return (0, _mongodb.GET_DB)().collection(_cardModel.cardModel.CARD_COLLECTION_NAME).find({
            boardId: templateBoard._id
          }).toArray();
        case 11:
          templateCards = _context0.sent;
          _context0.next = 14;
          return (0, _mongodb.GET_DB)().collection(_labelModel.labelModel.LABEL_COLLECTION_NAME).find({
            boardId: templateBoard._id
          }).toArray();
        case 14:
          templateLabels = _context0.sent;
          // 2. Create new board based on template
          newTitle = "".concat(templateBoard.title, " (B\u1EA3n sao)");
          newBoardData = {
            title: newTitle,
            slug: (0, _formatter.slugify)(newTitle),
            description: templateBoard.description,
            type: 'private',
            // User's cloned board might be private by default
            background: templateBoard.background,
            isTemplate: false
          };
          _context0.next = 19;
          return _boardModel.boardModel.createNew(userId, newBoardData);
        case 19:
          createdBoard = _context0.sent;
          newBoardId = createdBoard.insertedId; // 3. Clone columns
          columnIdMapping = {};
          newColumnOrderIds = [];
          _iterator = _createForOfIteratorHelper(templateColumns);
          _context0.prev = 24;
          _iterator.s();
        case 26:
          if ((_step = _iterator.n()).done) {
            _context0.next = 36;
            break;
          }
          _col = _step.value;
          newColData = {
            boardId: newBoardId,
            title: _col.title,
            cardOrderIds: [],
            createdAt: Date.now(),
            updatedAt: null,
            _destroy: false
          };
          _context0.next = 31;
          return (0, _mongodb.GET_DB)().collection(_columnModel.columnModel.COLUMN_COLLECTION_NAME).insertOne(newColData);
        case 31:
          createdCol = _context0.sent;
          columnIdMapping[_col._id.toString()] = createdCol.insertedId;
          newColumnOrderIds.push(createdCol.insertedId);
        case 34:
          _context0.next = 26;
          break;
        case 36:
          _context0.next = 41;
          break;
        case 38:
          _context0.prev = 38;
          _context0.t0 = _context0["catch"](24);
          _iterator.e(_context0.t0);
        case 41:
          _context0.prev = 41;
          _iterator.f();
          return _context0.finish(41);
        case 44:
          // Clone labels
          labelIdMapping = {};
          newLabelsData = [];
          _iterator2 = _createForOfIteratorHelper(templateLabels);
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              label = _step2.value;
              newLabelId = new _mongodb2.ObjectId();
              labelIdMapping[label._id.toString()] = newLabelId;
              newLabel = _objectSpread(_objectSpread({}, label), {}, {
                _id: newLabelId,
                boardId: newBoardId,
                createdAt: Date.now()
              });
              newLabelsData.push(newLabel);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          if (!(newLabelsData.length > 0)) {
            _context0.next = 51;
            break;
          }
          _context0.next = 51;
          return (0, _mongodb.GET_DB)().collection(_labelModel.labelModel.LABEL_COLLECTION_NAME).insertMany(newLabelsData);
        case 51:
          // Clone cards
          cardIdMapping = {};
          newCardsData = [];
          _iterator3 = _createForOfIteratorHelper(templateCards);
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              card = _step3.value;
              _newColId = columnIdMapping[card.columnId.toString()];
              if (_newColId) {
                newCardId = new _mongodb2.ObjectId();
                cardIdMapping[card._id.toString()] = newCardId;

                // Map labelIds
                mappedLabelIds = (card.labelIds || []).map(function (oldLabelId) {
                  return labelIdMapping[oldLabelId.toString()];
                }).filter(function (id) {
                  return id;
                });
                newCard = _objectSpread(_objectSpread({}, card), {}, {
                  _id: newCardId,
                  boardId: newBoardId,
                  columnId: _newColId,
                  labelIds: mappedLabelIds,
                  memberIds: [],
                  // Reset members
                  createdAt: Date.now(),
                  updatedAt: null
                });
                newCardsData.push(newCard);
              }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          if (!(newCardsData.length > 0)) {
            _context0.next = 58;
            break;
          }
          _context0.next = 58;
          return (0, _mongodb.GET_DB)().collection(_cardModel.cardModel.CARD_COLLECTION_NAME).insertMany(newCardsData);
        case 58:
          if (!(newColumnOrderIds.length > 0)) {
            _context0.next = 82;
            break;
          }
          orderedNewColIds = templateBoard.columnOrderIds.map(function (oldId) {
            return columnIdMapping[oldId.toString()];
          }).filter(function (id) {
            return id;
          });
          _context0.next = 62;
          return _boardModel.boardModel.update(newBoardId, {
            columnOrderIds: orderedNewColIds
          });
        case 62:
          // Update cardOrderIds for new columns
          _iterator4 = _createForOfIteratorHelper(templateColumns);
          _context0.prev = 63;
          _iterator4.s();
        case 65:
          if ((_step4 = _iterator4.n()).done) {
            _context0.next = 74;
            break;
          }
          col = _step4.value;
          newColId = columnIdMapping[col._id.toString()];
          if (!(newColId && col.cardOrderIds && col.cardOrderIds.length > 0)) {
            _context0.next = 72;
            break;
          }
          // Map old card IDs to new card IDs
          newCardOrderIds = col.cardOrderIds.map(function (oldCardId) {
            return cardIdMapping[oldCardId.toString()];
          }).filter(function (id) {
            return id;
          });
          _context0.next = 72;
          return _columnModel.columnModel.update(newColId, {
            cardOrderIds: newCardOrderIds
          });
        case 72:
          _context0.next = 65;
          break;
        case 74:
          _context0.next = 79;
          break;
        case 76:
          _context0.prev = 76;
          _context0.t1 = _context0["catch"](63);
          _iterator4.e(_context0.t1);
        case 79:
          _context0.prev = 79;
          _iterator4.f();
          return _context0.finish(79);
        case 82:
          _context0.next = 84;
          return _boardModel.boardModel.findOneById(newBoardId);
        case 84:
          return _context0.abrupt("return", _context0.sent);
        case 87:
          _context0.prev = 87;
          _context0.t2 = _context0["catch"](0);
          throw _context0.t2;
        case 90:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 87], [24, 38, 41, 44], [63, 76, 79, 82]]);
  }));
  return function cloneTemplate(_x16, _x17) {
    return _ref0.apply(this, arguments);
  };
}();
var getArchivedItems = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(boardId) {
    var archivedCards, archivedColumns;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          _context1.next = 3;
          return _cardModel.cardModel.getArchivedByBoardId(boardId);
        case 3:
          archivedCards = _context1.sent;
          _context1.next = 6;
          return _columnModel.columnModel.getArchivedByBoardId(boardId);
        case 6:
          archivedColumns = _context1.sent;
          return _context1.abrupt("return", {
            cards: archivedCards,
            columns: archivedColumns
          });
        case 10:
          _context1.prev = 10;
          _context1.t0 = _context1["catch"](0);
          throw _context1.t0;
        case 13:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[0, 10]]);
  }));
  return function getArchivedItems(_x18) {
    return _ref1.apply(this, arguments);
  };
}();
var boardService = {
  createNew: createNew,
  getDetails: getDetails,
  update: update,
  updateVisibility: updateVisibility,
  moveCardifferentColumn: moveCardifferentColumn,
  getBoards: getBoards,
  getTemplates: getTemplates,
  cloneTemplate: cloneTemplate,
  deleteItem: deleteItem,
  bulkDeleteItems: bulkDeleteItems,
  getArchivedItems: getArchivedItems
};
exports.boardService = boardService;