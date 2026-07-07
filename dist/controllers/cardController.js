"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cardController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _cardService = require("../services/cardService");
var _notificationService = require("../services/notificationService");
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var createCard;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _cardService.cardService.createNew(req.body);
        case 3:
          createCard = _context.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(createCard);

          // Thông báo "board activity" (in-app) cho các thành viên board — best-effort, không chặn response
          if (createCard !== null && createCard !== void 0 && createCard.boardId) {
            _notificationService.notificationService.notifyBoardActivity({
              io: req.app.get('socketio'),
              boardId: createCard.boardId.toString(),
              actorId: req.jwtDecoded._id,
              detail: "added the card \"".concat(createCard.title, "\"")
            });
          }
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
var duplicateCard = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var userId, _req$body, cardId, targetColumnId, newCard;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          userId = req.jwtDecoded._id;
          _req$body = req.body, cardId = _req$body.cardId, targetColumnId = _req$body.targetColumnId;
          _context2.next = 5;
          return _cardService.cardService.duplicateCard(cardId, targetColumnId, userId);
        case 5:
          newCard = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(newCard);
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
  return function duplicateCard(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var cardId, cardCoverFile, userInfo, updatedCard;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          cardId = req.params.id;
          cardCoverFile = req.file;
          userInfo = req.jwtDecoded;
          _context3.next = 6;
          return _cardService.cardService.update(cardId, req.body, cardCoverFile, userInfo);
        case 6:
          updatedCard = _context3.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedCard);
          _context3.next = 13;
          break;
        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          next(_context3.t0);
        case 13:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 10]]);
  }));
  return function update(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var uploadAttachment = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var cardId, attachmentFile, userInfo, updatedCard;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          cardId = req.params.id;
          attachmentFile = req.file;
          userInfo = req.jwtDecoded;
          _context4.next = 6;
          return _cardService.cardService.uploadAttachment(cardId, attachmentFile, userInfo);
        case 6:
          updatedCard = _context4.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedCard);
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
  return function uploadAttachment(_x0, _x1, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var deleteAttachment = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var cardId, publicId, userInfo, updatedCard;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          cardId = req.params.id;
          publicId = req.body.publicId;
          userInfo = req.jwtDecoded;
          _context5.next = 6;
          return _cardService.cardService.deleteAttachment(cardId, publicId, userInfo);
        case 6:
          updatedCard = _context5.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedCard);
          _context5.next = 13;
          break;
        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](0);
          next(_context5.t0);
        case 13:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 10]]);
  }));
  return function deleteAttachment(_x11, _x12, _x13) {
    return _ref5.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var cardId, userInfo, result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          cardId = req.params.id;
          userInfo = req.jwtDecoded;
          _context6.next = 5;
          return _cardService.cardService.deleteItem(cardId, userInfo);
        case 5:
          result = _context6.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);

          // Thông báo "board activity" (in-app) cho thành viên board — best-effort, không chặn response
          if (result !== null && result !== void 0 && result.boardId) {
            _notificationService.notificationService.notifyBoardActivity({
              io: req.app.get('socketio'),
              boardId: result.boardId.toString(),
              actorId: userInfo._id,
              detail: "deleted the card \"".concat(result.cardTitle, "\"")
            });
          }
          _context6.next = 13;
          break;
        case 10:
          _context6.prev = 10;
          _context6.t0 = _context6["catch"](0);
          next(_context6.t0);
        case 13:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 10]]);
  }));
  return function deleteItem(_x14, _x15, _x16) {
    return _ref6.apply(this, arguments);
  };
}();
var archiveCard = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var cardId, userInfo, result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          cardId = req.params.id;
          userInfo = req.jwtDecoded;
          _context7.next = 5;
          return _cardService.cardService.archiveCard(cardId, userInfo);
        case 5:
          result = _context7.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);

          // Thông báo "board activity" (in-app) cho thành viên board — best-effort, không chặn response
          if (result !== null && result !== void 0 && result.boardId) {
            _notificationService.notificationService.notifyBoardActivity({
              io: req.app.get('socketio'),
              boardId: result.boardId.toString(),
              actorId: userInfo._id,
              detail: "archived the card \"".concat(result.cardTitle, "\"")
            });
          }
          _context7.next = 13;
          break;
        case 10:
          _context7.prev = 10;
          _context7.t0 = _context7["catch"](0);
          next(_context7.t0);
        case 13:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 10]]);
  }));
  return function archiveCard(_x17, _x18, _x19) {
    return _ref7.apply(this, arguments);
  };
}();
var restoreCard = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var cardId, newColumnId, result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          cardId = req.params.id;
          newColumnId = req.body.newColumnId;
          _context8.next = 5;
          return _cardService.cardService.restoreCard(cardId, newColumnId);
        case 5:
          result = _context8.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json({
            message: 'Card restored successfully!',
            card: result
          });
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
  return function restoreCard(_x20, _x21, _x22) {
    return _ref8.apply(this, arguments);
  };
}();

// ===== TEMPLATE CONTROLLERS =====
var saveAsTemplate = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var cardId, template;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          cardId = req.params.id;
          _context9.next = 4;
          return _cardService.cardService.saveAsTemplate(cardId);
        case 4:
          template = _context9.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(template);
          _context9.next = 11;
          break;
        case 8:
          _context9.prev = 8;
          _context9.t0 = _context9["catch"](0);
          next(_context9.t0);
        case 11:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 8]]);
  }));
  return function saveAsTemplate(_x23, _x24, _x25) {
    return _ref9.apply(this, arguments);
  };
}();
var useTemplate = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(req, res, next) {
    var _req$body2, templateId, targetColumnId, newCard;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _req$body2 = req.body, templateId = _req$body2.templateId, targetColumnId = _req$body2.targetColumnId;
          _context0.next = 4;
          return _cardService.cardService.useTemplate(templateId, targetColumnId);
        case 4:
          newCard = _context0.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(newCard);
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
  return function useTemplate(_x26, _x27, _x28) {
    return _ref0.apply(this, arguments);
  };
}();
var deleteTemplate = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(req, res, next) {
    var templateId, result;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          templateId = req.params.id;
          _context1.next = 4;
          return _cardService.cardService.deleteTemplate(templateId);
        case 4:
          result = _context1.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json({
            message: 'Template deleted successfully!',
            result: result
          });
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
  return function deleteTemplate(_x29, _x30, _x31) {
    return _ref1.apply(this, arguments);
  };
}();
var cardController = {
  createNew: createNew,
  update: update,
  uploadAttachment: uploadAttachment,
  deleteAttachment: deleteAttachment,
  deleteItem: deleteItem,
  archiveCard: archiveCard,
  restoreCard: restoreCard,
  saveAsTemplate: saveAsTemplate,
  useTemplate: useTemplate,
  deleteTemplate: deleteTemplate,
  duplicateCard: duplicateCard
};
exports.cardController = cardController;