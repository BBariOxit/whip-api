"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boardService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _formatter = require("../utils/formatter");
var _boardModel = require("../models/boardModel");
var _columnModel = require("../models/columnModel");
var _cardModel = require("../models/cardModel");
var _labelModel = require("../models/labelModel");
var _mongodb = require("../config/mongodb");
var _userModel = require("../models/userModel");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _httpStatusCodes = require("http-status-codes");
var _validators = require("../utils/validators");
var _constants = require("../utils/constants");
var _workspaceModel = require("../models/workspaceModel");
var _mongodb2 = require("mongodb");
var _rbacMiddleware = require("../middlewares/rbacMiddleware");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; } /* eslint-disable no-useless-catch */
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(userId, reqBody) {
    var workspace, actor, newBoard, createdBoard, getNewBoard;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          if (!reqBody.workspaceId) {
            _context.next = 12;
            break;
          }
          _context.next = 4;
          return _workspaceModel.workspaceModel.findById(reqBody.workspaceId);
        case 4:
          workspace = _context.sent;
          if (workspace) {
            _context.next = 7;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 7:
          actor = workspace.members.find(function (m) {
            var _m$userId;
            return ((_m$userId = m.userId) === null || _m$userId === void 0 ? void 0 : _m$userId.toString()) === userId.toString() && m.status === 'active';
          });
          if (actor) {
            _context.next = 10;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'You are not a member of this workspace!');
        case 10:
          if (!(workspace.boardCreation !== 'all' && actor.role === _constants.WORKSPACE_ROLES.MEMBER)) {
            _context.next = 12;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Only Owner and Admin can create boards in this workspace.');
        case 12:
          // xử lý logic dữ liệu
          newBoard = _objectSpread(_objectSpread({}, reqBody), {}, {
            slug: (0, _formatter.slugify)(reqBody.title)
          }); // gọi tới tầng model để xử lý lưu bản ghi newBoard vào trong database
          _context.next = 15;
          return _boardModel.boardModel.createNew(userId, newBoard);
        case 15:
          createdBoard = _context.sent;
          _context.next = 18;
          return _boardModel.boardModel.findOneById(createdBoard.insertedId);
        case 18:
          getNewBoard = _context.sent;
          return _context.abrupt("return", getNewBoard);
        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](0);
          throw _context.t0;
        case 25:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 22]]);
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
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Only the creator of this board can change its visibility!');
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
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(reqBody, userId) {
    var _yield$Promise$all, _yield$Promise$all2, card, prevColumn, nextColumn, boardId, board, role;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return Promise.all([_cardModel.cardModel.findOneById(reqBody.currCardId), _columnModel.columnModel.findOneById(reqBody.prevColumnId), _columnModel.columnModel.findOneById(reqBody.nextColumnId)]);
        case 3:
          _yield$Promise$all = _context5.sent;
          _yield$Promise$all2 = (0, _slicedToArray2["default"])(_yield$Promise$all, 3);
          card = _yield$Promise$all2[0];
          prevColumn = _yield$Promise$all2[1];
          nextColumn = _yield$Promise$all2[2];
          if (!(!card || !prevColumn || !nextColumn)) {
            _context5.next = 10;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Card or column not found!');
        case 10:
          // 👑 Chống IDOR: card và cả 2 column bắt buộc cùng thuộc 1 board
          boardId = card.boardId.toString();
          if (!(prevColumn.boardId.toString() !== boardId || nextColumn.boardId.toString() !== boardId)) {
            _context5.next = 13;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Card and columns must belong to the same board!');
        case 13:
          _context5.next = 15;
          return _boardModel.boardModel.findOneById(boardId);
        case 15:
          board = _context5.sent;
          if (!board) {
            _context5.next = 22;
            break;
          }
          _context5.next = 19;
          return (0, _rbacMiddleware.getBoardAccessRole)(board, userId);
        case 19:
          _context5.t0 = _context5.sent;
          _context5.next = 23;
          break;
        case 22:
          _context5.t0 = 'none';
        case 23:
          role = _context5.t0;
          if (!(role !== 'admin' && role !== 'member')) {
            _context5.next = 26;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'You do not have permission to move cards on this board!');
        case 26:
          _context5.next = 28;
          return _columnModel.columnModel.update(reqBody.prevColumnId, {
            cardOrderIds: reqBody.prevCardOrderIds,
            updatedAt: Date.now()
          });
        case 28:
          _context5.next = 30;
          return _columnModel.columnModel.update(reqBody.nextColumnId, {
            cardOrderIds: reqBody.nexCardOrderIds,
            updatedAt: Date.now()
          });
        case 30:
          _context5.next = 32;
          return _cardModel.cardModel.update(reqBody.currCardId, {
            columnId: reqBody.nextColumnId
          });
        case 32:
          return _context5.abrupt("return", {
            updateResult: 'Sucessfully!'
          });
        case 35:
          _context5.prev = 35;
          _context5.t1 = _context5["catch"](0);
          throw _context5.t1;
        case 38:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 35]]);
  }));
  return function moveCardifferentColumn(_x0, _x1) {
    return _ref5.apply(this, arguments);
  };
}();
var getBoards = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(userId, page, itemsPerPage, queryFilters, sortOption) {
    var results;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          if (!page) page = _constants.DEFAULT_PAGE;
          if (!itemsPerPage) itemsPerPage = _constants.DEFAULT_ITEMS_PER_PAGE;
          _context6.next = 5;
          return _boardModel.boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10), queryFilters, sortOption);
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
  return function getBoards(_x10, _x11, _x12, _x13, _x14) {
    return _ref6.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(boardId, actorBoardRole) {
    var targetBoard, workspace;
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
          if (!(actorBoardRole === 'member' && targetBoard.workspaceId)) {
            _context7.next = 12;
            break;
          }
          _context7.next = 9;
          return _workspaceModel.workspaceModel.findById(targetBoard.workspaceId.toString());
        case 9:
          workspace = _context7.sent;
          if (!(!workspace || workspace.boardDeletion !== 'all')) {
            _context7.next = 12;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Only Owner and Admin can delete boards in this workspace.');
        case 12:
          _context7.next = 14;
          return _boardModel.boardModel.deleteOneById(boardId);
        case 14:
          _context7.next = 16;
          return _columnModel.columnModel.deleteManyByBoardId(boardId);
        case 16:
          _context7.next = 18;
          return _cardModel.cardModel.deleteManyByBoardId(boardId);
        case 18:
          return _context7.abrupt("return", {
            deleteResult: 'Board and its Columns, Cards deleted successfully!',
            workspaceId: targetBoard.workspaceId,
            boardTitle: targetBoard.title
          });
        case 21:
          _context7.prev = 21;
          _context7.t0 = _context7["catch"](0);
          throw _context7.t0;
        case 24:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 21]]);
  }));
  return function deleteItem(_x15, _x16) {
    return _ref7.apply(this, arguments);
  };
}();
var bulkDeleteItems = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(userId, boardIds) {
    var objectIds, db, boardsToDelete, allowedBoardIds, _iterator, _step, board, workspace;
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
          // Enforce workspace boardDeletion setting cho từng board
          // Lọc ra những board mà user thực sự được phép xóa
          allowedBoardIds = [];
          _iterator = _createForOfIteratorHelper(boardsToDelete);
          _context8.prev = 10;
          _iterator.s();
        case 12:
          if ((_step = _iterator.n()).done) {
            _context8.next = 24;
            break;
          }
          board = _step.value;
          if (!board.workspaceId) {
            _context8.next = 21;
            break;
          }
          _context8.next = 17;
          return _workspaceModel.workspaceModel.findById(board.workspaceId.toString());
        case 17:
          workspace = _context8.sent;
          // Nếu user là board owner (ownerIds) thì luôn được xóa (vì họ là admin của board)
          // bulkDelete đã filter ownerIds rồi nên đến được đây đều là board admin → luôn cho phép
          allowedBoardIds.push(board._id);
          _context8.next = 22;
          break;
        case 21:
          allowedBoardIds.push(board._id);
        case 22:
          _context8.next = 12;
          break;
        case 24:
          _context8.next = 29;
          break;
        case 26:
          _context8.prev = 26;
          _context8.t0 = _context8["catch"](10);
          _iterator.e(_context8.t0);
        case 29:
          _context8.prev = 29;
          _iterator.f();
          return _context8.finish(29);
        case 32:
          if (!(allowedBoardIds.length > 0)) {
            _context8.next = 41;
            break;
          }
          _context8.next = 35;
          return db.collection(_boardModel.boardModel.BOARD_COLLECTION_NAME).deleteMany({
            _id: {
              $in: allowedBoardIds
            }
          });
        case 35:
          _context8.next = 37;
          return db.collection(_columnModel.columnModel.COLUMN_COLLECTION_NAME).deleteMany({
            boardId: {
              $in: allowedBoardIds
            }
          });
        case 37:
          _context8.next = 39;
          return db.collection(_cardModel.cardModel.CARD_COLLECTION_NAME).deleteMany({
            boardId: {
              $in: allowedBoardIds
            }
          });
        case 39:
          _context8.next = 41;
          return db.collection(_labelModel.labelModel.LABEL_COLLECTION_NAME).deleteMany({
            boardId: {
              $in: allowedBoardIds
            }
          });
        case 41:
          return _context8.abrupt("return", {
            deleteResult: "Successfully deleted ".concat(allowedBoardIds.length, " boards!")
          });
        case 44:
          _context8.prev = 44;
          _context8.t1 = _context8["catch"](0);
          throw _context8.t1;
        case 47:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 44], [10, 26, 29, 32]]);
  }));
  return function bulkDeleteItems(_x17, _x18) {
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
    var templateBoard, templateColumns, templateCards, templateLabels, newTitle, newBoardData, createdBoard, newBoardId, columnIdMapping, newColumnOrderIds, _iterator2, _step2, _col, newColData, createdCol, labelIdMapping, newLabelsData, _iterator3, _step3, label, newLabelId, newLabel, cardIdMapping, newCardsData, _iterator4, _step4, card, _newColId, newCardId, mappedLabelIds, newCard, orderedNewColIds, _iterator5, _step5, col, newColId, newCardOrderIds;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _context0.next = 3;
          return _boardModel.boardModel.findOneById(templateBoardId);
        case 3:
          templateBoard = _context0.sent;
          if (!(!templateBoard || !templateBoard.isTemplate || templateBoard._destroy)) {
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
          // 2. Tạo board mới từ template.
          // Cố tình KHÔNG gán workspaceId => board thuộc "Personal Boards" của user.
          // boardModel.createNew sẽ tự set ownerIds = [userId] => người clone chính là chủ board.
          newTitle = "".concat(templateBoard.title, " (B\u1EA3n sao)");
          newBoardData = {
            title: newTitle,
            slug: (0, _formatter.slugify)(newTitle),
            description: templateBoard.description,
            type: 'private',
            // Board mới mặc định private, chỉ mình chủ board thấy
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
          _iterator2 = _createForOfIteratorHelper(templateColumns);
          _context0.prev = 24;
          _iterator2.s();
        case 26:
          if ((_step2 = _iterator2.n()).done) {
            _context0.next = 36;
            break;
          }
          _col = _step2.value;
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
          _iterator2.e(_context0.t0);
        case 41:
          _context0.prev = 41;
          _iterator2.f();
          return _context0.finish(41);
        case 44:
          // Clone labels
          labelIdMapping = {};
          newLabelsData = [];
          _iterator3 = _createForOfIteratorHelper(templateLabels);
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              label = _step3.value;
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
            _iterator3.e(err);
          } finally {
            _iterator3.f();
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
          _iterator4 = _createForOfIteratorHelper(templateCards);
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              card = _step4.value;
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
            _iterator4.e(err);
          } finally {
            _iterator4.f();
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
          _iterator5 = _createForOfIteratorHelper(templateColumns);
          _context0.prev = 63;
          _iterator5.s();
        case 65:
          if ((_step5 = _iterator5.n()).done) {
            _context0.next = 74;
            break;
          }
          col = _step5.value;
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
          _iterator5.e(_context0.t1);
        case 79:
          _context0.prev = 79;
          _iterator5.f();
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
  return function cloneTemplate(_x19, _x20) {
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
  return function getArchivedItems(_x21) {
    return _ref1.apply(this, arguments);
  };
}();
var joinBoard = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(userId, boardId) {
    var _board$memberIds2, _board$ownerIds3, board, isAlreadyJoined, isOwner, newMember;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _context10.next = 3;
          return _boardModel.boardModel.findOneById(boardId);
        case 3:
          board = _context10.sent;
          if (board) {
            _context10.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Board not found!');
        case 6:
          if (!(board.type === 'private')) {
            _context10.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Cannot join a private board!');
        case 8:
          isAlreadyJoined = (_board$memberIds2 = board.memberIds) === null || _board$memberIds2 === void 0 ? void 0 : _board$memberIds2.some(function (id) {
            return id.toString() === userId.toString();
          });
          isOwner = (_board$ownerIds3 = board.ownerIds) === null || _board$ownerIds3 === void 0 ? void 0 : _board$ownerIds3.some(function (id) {
            return id.toString() === userId.toString();
          });
          if (!(isAlreadyJoined || isOwner)) {
            _context10.next = 12;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'You are already a member of this board!');
        case 12:
          _context10.next = 14;
          return _boardModel.boardModel.pushMemberIds(boardId, userId);
        case 14:
          _context10.next = 16;
          return _userModel.userModel.findOneById(userId);
        case 16:
          newMember = _context10.sent;
          return _context10.abrupt("return", {
            _id: newMember._id,
            email: newMember.email,
            username: newMember.username,
            displayName: newMember.displayName,
            avatar: newMember.avatar
          });
        case 20:
          _context10.prev = 20;
          _context10.t0 = _context10["catch"](0);
          throw _context10.t0;
        case 23:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 20]]);
  }));
  return function joinBoard(_x22, _x23) {
    return _ref10.apply(this, arguments);
  };
}();
var leaveBoard = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(userId, boardId) {
    var _board$memberIds3, _board$ownerIds4, board, isMember, isOwner, result;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          _context11.next = 3;
          return _boardModel.boardModel.findOneById(boardId);
        case 3:
          board = _context11.sent;
          if (board) {
            _context11.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Board not found!');
        case 6:
          isMember = (_board$memberIds3 = board.memberIds) === null || _board$memberIds3 === void 0 ? void 0 : _board$memberIds3.some(function (id) {
            return id.toString() === userId.toString();
          });
          if (isMember) {
            _context11.next = 9;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'You are not a member of this board!');
        case 9:
          isOwner = (_board$ownerIds4 = board.ownerIds) === null || _board$ownerIds4 === void 0 ? void 0 : _board$ownerIds4.some(function (id) {
            return id.toString() === userId.toString();
          });
          if (!isOwner) {
            _context11.next = 12;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'The board owner cannot leave. Transfer ownership first or delete the board.');
        case 12:
          _context11.next = 14;
          return _boardModel.boardModel.pullMemberIds(boardId, userId);
        case 14:
          result = _context11.sent;
          return _context11.abrupt("return", result);
        case 18:
          _context11.prev = 18;
          _context11.t0 = _context11["catch"](0);
          throw _context11.t0;
        case 21:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 18]]);
  }));
  return function leaveBoard(_x24, _x25) {
    return _ref11.apply(this, arguments);
  };
}();
var getStarredBoards = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee12(userId) {
    var results;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          _context12.next = 3;
          return _boardModel.boardModel.getStarredBoards(userId);
        case 3:
          results = _context12.sent;
          return _context12.abrupt("return", results);
        case 7:
          _context12.prev = 7;
          _context12.t0 = _context12["catch"](0);
          throw _context12.t0;
        case 10:
        case "end":
          return _context12.stop();
      }
    }, _callee12, null, [[0, 7]]);
  }));
  return function getStarredBoards(_x26) {
    return _ref12.apply(this, arguments);
  };
}();
var toggleStarred = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee13(userId, boardId) {
    var _board$ownerIds5, _board$memberIds4, _board$starredBy, board, isOwner, isMember, isStarred;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          if (_validators.OBJECT_ID_RULE.test(boardId)) {
            _context13.next = 3;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Invalid board id');
        case 3:
          _context13.next = 5;
          return _boardModel.boardModel.findOneById(boardId);
        case 5:
          board = _context13.sent;
          if (!(!board || board._destroy)) {
            _context13.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Board not found!');
        case 8:
          // 👑 Chốt chặn bảo mật: không cho user gắn sao một board private mà họ không thuộc về.
          // (Cùng nguyên tắc gatekeeper như getDetails ở trên)
          isOwner = (_board$ownerIds5 = board.ownerIds) === null || _board$ownerIds5 === void 0 ? void 0 : _board$ownerIds5.some(function (id) {
            return id.toString() === userId;
          });
          isMember = (_board$memberIds4 = board.memberIds) === null || _board$memberIds4 === void 0 ? void 0 : _board$memberIds4.some(function (id) {
            return id.toString() === userId;
          });
          if (!(board.type === 'private' && !isOwner && !isMember)) {
            _context13.next = 12;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Access denied. You cannot star a private board you do not belong to.');
        case 12:
          // Toggle: đang có sao thì gỡ, chưa có thì thêm
          isStarred = (_board$starredBy = board.starredBy) === null || _board$starredBy === void 0 ? void 0 : _board$starredBy.some(function (id) {
            return id.toString() === userId;
          });
          if (!isStarred) {
            _context13.next = 17;
            break;
          }
          _context13.next = 16;
          return _boardModel.boardModel.unstarBoard(boardId, userId);
        case 16:
          return _context13.abrupt("return", {
            boardId: boardId,
            starred: false
          });
        case 17:
          _context13.next = 19;
          return _boardModel.boardModel.starBoard(boardId, userId);
        case 19:
          return _context13.abrupt("return", {
            boardId: boardId,
            starred: true
          });
        case 22:
          _context13.prev = 22;
          _context13.t0 = _context13["catch"](0);
          throw _context13.t0;
        case 25:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[0, 22]]);
  }));
  return function toggleStarred(_x27, _x28) {
    return _ref13.apply(this, arguments);
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
  getArchivedItems: getArchivedItems,
  joinBoard: joinBoard,
  leaveBoard: leaveBoard,
  getStarredBoards: getStarredBoards,
  toggleStarred: toggleStarred
};
exports.boardService = boardService;