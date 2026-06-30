"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boardController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _boardService = require("../services/boardService");
var _cardService = require("../services/cardService");
var _columnService = require("../services/columnService");
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var userId, createBoard;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          // console.log('req.body', req.body)
          // console.log('req.query', req.query)
          // console.log('req.param', req.query)
          userId = req.jwtDecoded._id; // điều hướng dữ liệu qua tầng service
          _context.next = 4;
          return _boardService.boardService.createNew(userId, req.body);
        case 4:
          createBoard = _context.sent;
          // có kq thì trả về phía client
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(createBoard);
          _context.next = 11;
          break;
        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          next(_context.t0);
        case 11:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 8]]);
  }));
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var getDetails = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var _req$jwtDecoded, userId, boardId, board;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          userId = (_req$jwtDecoded = req.jwtDecoded) === null || _req$jwtDecoded === void 0 ? void 0 : _req$jwtDecoded._id;
          boardId = req.params.id; // điều hướng dữ liệu qua tầng service
          _context2.next = 5;
          return _boardService.boardService.getDetails(userId, boardId);
        case 5:
          board = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(board);
          _context2.next = 12;
          break;
        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          next(_context2.t0);
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 9]]);
  }));
  return function getDetails(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var boardId, updatedBoard;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          boardId = req.params.id;
          _context3.next = 4;
          return _boardService.boardService.update(boardId, req.body);
        case 4:
          updatedBoard = _context3.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedBoard);
          _context3.next = 11;
          break;
        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          next(_context3.t0);
        case 11:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 8]]);
  }));
  return function update(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var updateVisibility = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var userId, boardId, type, updatedBoard;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          userId = req.jwtDecoded._id;
          boardId = req.params.id;
          type = req.body.type;
          _context4.next = 6;
          return _boardService.boardService.updateVisibility(userId, boardId, type);
        case 6:
          updatedBoard = _context4.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json({
            message: "Board visibility changed to ".concat(type, " successfully!"),
            board: updatedBoard
          });
          _context4.next = 13;
          break;
        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](0);
          next(_context4.t0);
        case 13:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 10]]);
  }));
  return function updateVisibility(_x0, _x1, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var moveCardifferentColumn = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return _boardService.boardService.moveCardifferentColumn(req.body);
        case 3:
          result = _context5.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context5.next = 10;
          break;
        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          next(_context5.t0);
        case 10:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 7]]);
  }));
  return function moveCardifferentColumn(_x11, _x12, _x13) {
    return _ref5.apply(this, arguments);
  };
}();
var getBoards = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var userId, _req$query, page, itemsPerPage, q, workspaceId, queryFilters, results;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          userId = req.jwtDecoded._id;
          _req$query = req.query, page = _req$query.page, itemsPerPage = _req$query.itemsPerPage, q = _req$query.q, workspaceId = _req$query.workspaceId;
          queryFilters = q || {};
          if (workspaceId !== undefined) {
            queryFilters.workspaceId = workspaceId;
          }
          _context6.next = 7;
          return _boardService.boardService.getBoards(userId, page, itemsPerPage, queryFilters);
        case 7:
          results = _context6.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(results);
          _context6.next = 14;
          break;
        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](0);
          next(_context6.t0);
        case 14:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 11]]);
  }));
  return function getBoards(_x14, _x15, _x16) {
    return _ref6.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var boardId, result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          boardId = req.params.id;
          _context7.next = 4;
          return _boardService.boardService.deleteItem(boardId);
        case 4:
          result = _context7.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context7.next = 11;
          break;
        case 8:
          _context7.prev = 8;
          _context7.t0 = _context7["catch"](0);
          next(_context7.t0);
        case 11:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 8]]);
  }));
  return function deleteItem(_x17, _x18, _x19) {
    return _ref7.apply(this, arguments);
  };
}();
var bulkDeleteItems = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var userId, boardIds, result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          userId = req.jwtDecoded._id;
          boardIds = req.body.boardIds;
          _context8.next = 5;
          return _boardService.boardService.bulkDeleteItems(userId, boardIds);
        case 5:
          result = _context8.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context8.next = 12;
          break;
        case 9:
          _context8.prev = 9;
          _context8.t0 = _context8["catch"](0);
          next(_context8.t0);
        case 12:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 9]]);
  }));
  return function bulkDeleteItems(_x20, _x21, _x22) {
    return _ref8.apply(this, arguments);
  };
}();
var getTemplates = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var results;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return _boardService.boardService.getTemplates();
        case 3:
          results = _context9.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(results);
          _context9.next = 10;
          break;
        case 7:
          _context9.prev = 7;
          _context9.t0 = _context9["catch"](0);
          next(_context9.t0);
        case 10:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 7]]);
  }));
  return function getTemplates(_x23, _x24, _x25) {
    return _ref9.apply(this, arguments);
  };
}();
var cloneTemplate = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(req, res, next) {
    var userId, templateBoardId, newBoard;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          userId = req.jwtDecoded._id;
          templateBoardId = req.body.templateBoardId;
          if (templateBoardId) {
            _context0.next = 5;
            break;
          }
          throw new ApiError(_httpStatusCodes.StatusCodes.BAD_REQUEST, 'templateBoardId is required');
        case 5:
          _context0.next = 7;
          return _boardService.boardService.cloneTemplate(userId, templateBoardId);
        case 7:
          newBoard = _context0.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json({
            newBoardId: newBoard._id
          });
          _context0.next = 14;
          break;
        case 11:
          _context0.prev = 11;
          _context0.t0 = _context0["catch"](0);
          next(_context0.t0);
        case 14:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 11]]);
  }));
  return function cloneTemplate(_x26, _x27, _x28) {
    return _ref0.apply(this, arguments);
  };
}();
var getArchivedItems = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(req, res, next) {
    var boardId, archivedItems;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          boardId = req.params.id;
          _context1.next = 4;
          return _boardService.boardService.getArchivedItems(boardId);
        case 4:
          archivedItems = _context1.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(archivedItems);
          _context1.next = 11;
          break;
        case 8:
          _context1.prev = 8;
          _context1.t0 = _context1["catch"](0);
          next(_context1.t0);
        case 11:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[0, 8]]);
  }));
  return function getArchivedItems(_x29, _x30, _x31) {
    return _ref1.apply(this, arguments);
  };
}();
var getCardTemplates = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res, next) {
    var boardId, templates;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          boardId = req.params.id;
          _context10.next = 4;
          return _cardService.cardService.getTemplatesByBoardId(boardId);
        case 4:
          templates = _context10.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(templates);
          _context10.next = 11;
          break;
        case 8:
          _context10.prev = 8;
          _context10.t0 = _context10["catch"](0);
          next(_context10.t0);
        case 11:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 8]]);
  }));
  return function getCardTemplates(_x32, _x33, _x34) {
    return _ref10.apply(this, arguments);
  };
}();
var getColumnTemplates = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res, next) {
    var boardId, templates;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          boardId = req.params.id;
          _context11.next = 4;
          return _columnService.columnService.getColumnTemplatesByBoardId(boardId);
        case 4:
          templates = _context11.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(templates);
          _context11.next = 11;
          break;
        case 8:
          _context11.prev = 8;
          _context11.t0 = _context11["catch"](0);
          next(_context11.t0);
        case 11:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 8]]);
  }));
  return function getColumnTemplates(_x35, _x36, _x37) {
    return _ref11.apply(this, arguments);
  };
}();
var boardController = {
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
  getCardTemplates: getCardTemplates,
  getColumnTemplates: getColumnTemplates
};
exports.boardController = boardController;