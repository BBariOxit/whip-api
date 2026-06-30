"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.columnController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _columnService = require("../services/columnService");
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var createColumn;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _columnService.columnService.createNew(req.body);
        case 3:
          createColumn = _context.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(createColumn);
          _context.next = 10;
          break;
        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          next(_context.t0);
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 7]]);
  }));
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var columnId, updatedColumn;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          columnId = req.params.id;
          _context2.next = 4;
          return _columnService.columnService.update(columnId, req.body);
        case 4:
          updatedColumn = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedColumn);
          _context2.next = 11;
          break;
        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          next(_context2.t0);
        case 11:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 8]]);
  }));
  return function update(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var columnId, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          columnId = req.params.id;
          _context3.next = 4;
          return _columnService.columnService.deleteItem(columnId);
        case 4:
          result = _context3.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
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
  return function deleteItem(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var clearAllCards = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var columnId, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          columnId = req.params.id;
          _context4.next = 4;
          return _columnService.columnService.clearAllCards(columnId);
        case 4:
          result = _context4.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context4.next = 11;
          break;
        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](0);
          next(_context4.t0);
        case 11:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 8]]);
  }));
  return function clearAllCards(_x0, _x1, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var updateAllCardsLayout = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var columnId, newLayout, result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          columnId = req.params.id;
          newLayout = req.body.newLayout;
          if (['compact', 'standard', 'detailed'].includes(newLayout)) {
            _context5.next = 5;
            break;
          }
          return _context5.abrupt("return", res.status(_httpStatusCodes.StatusCodes.BAD_REQUEST).json({
            error: 'Invalid layout code'
          }));
        case 5:
          _context5.next = 7;
          return _columnService.columnService.updateAllCardsLayout(columnId, newLayout);
        case 7:
          result = _context5.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context5.next = 14;
          break;
        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          next(_context5.t0);
        case 14:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 11]]);
  }));
  return function updateAllCardsLayout(_x11, _x12, _x13) {
    return _ref5.apply(this, arguments);
  };
}();
var archiveColumn = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var columnId, result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          columnId = req.params.id;
          _context6.next = 4;
          return _columnService.columnService.archiveColumn(columnId);
        case 4:
          result = _context6.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context6.next = 11;
          break;
        case 8:
          _context6.prev = 8;
          _context6.t0 = _context6["catch"](0);
          next(_context6.t0);
        case 11:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 8]]);
  }));
  return function archiveColumn(_x14, _x15, _x16) {
    return _ref6.apply(this, arguments);
  };
}();
var restoreColumn = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var columnId, result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          columnId = req.params.id;
          _context7.next = 4;
          return _columnService.columnService.restoreColumn(columnId);
        case 4:
          result = _context7.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json({
            message: 'Column restored successfully!',
            column: result
          });
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
  return function restoreColumn(_x17, _x18, _x19) {
    return _ref7.apply(this, arguments);
  };
}();
var saveAsTemplate = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var columnId, result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          columnId = req.params.id;
          _context8.next = 4;
          return _columnService.columnService.saveAsTemplate(columnId);
        case 4:
          result = _context8.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json({
            message: 'Column saved as template successfully!',
            template: result
          });
          _context8.next = 11;
          break;
        case 8:
          _context8.prev = 8;
          _context8.t0 = _context8["catch"](0);
          next(_context8.t0);
        case 11:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 8]]);
  }));
  return function saveAsTemplate(_x20, _x21, _x22) {
    return _ref8.apply(this, arguments);
  };
}();
var useColumnTemplate = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var _req$body, templateId, boardId, result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _req$body = req.body, templateId = _req$body.templateId, boardId = _req$body.boardId;
          if (!(!templateId || !boardId)) {
            _context9.next = 4;
            break;
          }
          return _context9.abrupt("return", res.status(_httpStatusCodes.StatusCodes.BAD_REQUEST).json({
            error: 'Missing templateId or boardId'
          }));
        case 4:
          _context9.next = 6;
          return _columnService.columnService.useColumnTemplate(templateId, boardId);
        case 6:
          result = _context9.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(result);
          _context9.next = 13;
          break;
        case 10:
          _context9.prev = 10;
          _context9.t0 = _context9["catch"](0);
          next(_context9.t0);
        case 13:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 10]]);
  }));
  return function useColumnTemplate(_x23, _x24, _x25) {
    return _ref9.apply(this, arguments);
  };
}();
var deleteColumnTemplate = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(req, res, next) {
    var templateId, result;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          templateId = req.params.id;
          _context0.next = 4;
          return _columnService.columnService.deleteColumnTemplate(templateId);
        case 4:
          result = _context0.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json({
            message: 'Template deleted successfully!',
            result: result
          });
          _context0.next = 11;
          break;
        case 8:
          _context0.prev = 8;
          _context0.t0 = _context0["catch"](0);
          next(_context0.t0);
        case 11:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 8]]);
  }));
  return function deleteColumnTemplate(_x26, _x27, _x28) {
    return _ref0.apply(this, arguments);
  };
}();
var duplicateColumn = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(req, res, next) {
    var newColumnWithCards;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          _context1.next = 3;
          return _columnService.columnService.duplicateColumn(req.body);
        case 3:
          newColumnWithCards = _context1.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(newColumnWithCards);
          _context1.next = 10;
          break;
        case 7:
          _context1.prev = 7;
          _context1.t0 = _context1["catch"](0);
          next(_context1.t0);
        case 10:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[0, 7]]);
  }));
  return function duplicateColumn(_x29, _x30, _x31) {
    return _ref1.apply(this, arguments);
  };
}();
var columnController = {
  createNew: createNew,
  update: update,
  deleteItem: deleteItem,
  clearAllCards: clearAllCards,
  updateAllCardsLayout: updateAllCardsLayout,
  archiveColumn: archiveColumn,
  restoreColumn: restoreColumn,
  saveAsTemplate: saveAsTemplate,
  useColumnTemplate: useColumnTemplate,
  deleteColumnTemplate: deleteColumnTemplate,
  duplicateColumn: duplicateColumn
};
exports.columnController = columnController;