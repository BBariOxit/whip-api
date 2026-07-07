"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _commentService = require("../services/commentService");
var _notificationService = require("../services/notificationService");
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var createdComment, io;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _commentService.commentService.createNew(req.body, req.jwtDecoded);
        case 3:
          createdComment = _context.sent;
          // Socket: Broadcast comment mới cho tất cả user đang mở Card này
          io = req.app.get('socketio');
          io.to("card:".concat(createdComment.cardId.toString())).emit('BE_NEW_COMMENT', createdComment);
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(createdComment);

          // Thông báo @mention (in-app) cho member được nhắc tên — best-effort, không chặn response
          _notificationService.notificationService.notifyMentions({
            io: io,
            cardId: createdComment.cardId.toString(),
            actorId: req.jwtDecoded._id,
            actorName: createdComment.userDisplayName,
            content: createdComment.content
          });
          _context.next = 13;
          break;
        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          next(_context.t0);
        case 13:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 10]]);
  }));
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var getComments = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var _req$query, cardId, page, limit, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$query = req.query, cardId = _req$query.cardId, page = _req$query.page, limit = _req$query.limit;
          _context2.next = 4;
          return _commentService.commentService.getComments(cardId, parseInt(page), parseInt(limit));
        case 4:
          result = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
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
  return function getComments(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var getReplies = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var parentId, _req$query2, page, limit, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          parentId = req.params.parentId;
          _req$query2 = req.query, page = _req$query2.page, limit = _req$query2.limit;
          _context3.next = 5;
          return _commentService.commentService.getReplies(parentId, parseInt(page), parseInt(limit));
        case 5:
          result = _context3.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context3.next = 12;
          break;
        case 9:
          _context3.prev = 9;
          _context3.t0 = _context3["catch"](0);
          next(_context3.t0);
        case 12:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 9]]);
  }));
  return function getReplies(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var updateComment = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var id, updatedComment, io;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          id = req.params.id;
          _context4.next = 4;
          return _commentService.commentService.updateComment(id, req.body, req.jwtDecoded);
        case 4:
          updatedComment = _context4.sent;
          // Socket: Broadcast comment đã chỉnh sửa cho room
          io = req.app.get('socketio');
          io.to("card:".concat(updatedComment.cardId)).emit('BE_COMMENT_UPDATED', updatedComment);
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedComment);
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
  return function updateComment(_x0, _x1, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var deleteComment = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var id, result, io;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          id = req.params.id;
          _context5.next = 4;
          return _commentService.commentService.deleteComment(id, req.jwtDecoded);
        case 4:
          result = _context5.sent;
          // Socket: Broadcast comment đã bị xóa cho room
          io = req.app.get('socketio');
          io.to("card:".concat(result.cardId)).emit('BE_COMMENT_DELETED', {
            commentId: id,
            parentId: result.parentId || null,
            cardId: result.cardId
          });
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
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
  return function deleteComment(_x11, _x12, _x13) {
    return _ref5.apply(this, arguments);
  };
}();
var commentController = {
  createNew: createNew,
  getComments: getComments,
  getReplies: getReplies,
  updateComment: updateComment,
  deleteComment: deleteComment
};
exports.commentController = commentController;