"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _commentModel = require("../models/commentModel");
var _userModel = require("../models/userModel");
var _cardModel = require("../models/cardModel");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(reqBody, userInfo) {
    var fullUser, newCommentData, parentComment, createdComment, getNewComment;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _userModel.userModel.findOneById(userInfo._id);
        case 3:
          fullUser = _context.sent;
          // 2. Prepare new comment data
          newCommentData = _objectSpread(_objectSpread({}, reqBody), {}, {
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.avatar) || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email
          }); // 3. Khóa đít an toàn: Ngăn chặn lồng đa cấp
          if (!newCommentData.parentId) {
            _context.next = 13;
            break;
          }
          _context.next = 8;
          return _commentModel.commentModel.findOneById(newCommentData.parentId);
        case 8:
          parentComment = _context.sent;
          if (parentComment) {
            _context.next = 11;
            break;
          }
          throw new Error('Comment gốc không tồn tại!');
        case 11:
          if (!parentComment.parentId) {
            _context.next = 13;
            break;
          }
          throw new Error('Chỉ cho phép lồng 1 cấp phản hồi!');
        case 13:
          _context.next = 15;
          return _commentModel.commentModel.createNew(newCommentData);
        case 15:
          createdComment = _context.sent;
          _context.next = 18;
          return _commentModel.commentModel.findOneById(createdComment.insertedId);
        case 18:
          getNewComment = _context.sent;
          if (!newCommentData.parentId) {
            _context.next = 22;
            break;
          }
          _context.next = 22;
          return _commentModel.commentModel.incrementReplyCount(newCommentData.parentId);
        case 22:
          _context.next = 24;
          return _cardModel.cardModel.incrementTotalComments(newCommentData.cardId);
        case 24:
          return _context.abrupt("return", getNewComment);
        case 27:
          _context.prev = 27;
          _context.t0 = _context["catch"](0);
          throw _context.t0;
        case 30:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 27]]);
  }));
  return function createNew(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var getComments = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(cardId, page, limit) {
    var result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return _commentModel.commentModel.getCommentsByCardId(cardId, page, limit);
        case 3:
          result = _context2.sent;
          return _context2.abrupt("return", result);
        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;
        case 10:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 7]]);
  }));
  return function getComments(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();
var getReplies = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(parentId, page, limit) {
    var result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return _commentModel.commentModel.getRepliesByParentId(parentId, page, limit);
        case 3:
          result = _context3.sent;
          return _context3.abrupt("return", result);
        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          throw _context3.t0;
        case 10:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 7]]);
  }));
  return function getReplies(_x6, _x7, _x8) {
    return _ref3.apply(this, arguments);
  };
}();
var updateComment = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(commentId, reqBody, userInfo) {
    var targetComment, updateData, updatedComment;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return _commentModel.commentModel.findOneById(commentId);
        case 3:
          targetComment = _context4.sent;
          if (targetComment) {
            _context4.next = 6;
            break;
          }
          throw new Error('Comment không tồn tại!');
        case 6:
          if (!(targetComment.userId.toString() !== userInfo._id.toString())) {
            _context4.next = 8;
            break;
          }
          throw new Error('Bạn không có quyền sửa comment này!');
        case 8:
          updateData = {
            content: reqBody.content,
            updatedAt: Date.now()
          };
          _context4.next = 11;
          return _commentModel.commentModel.update(commentId, updateData);
        case 11:
          updatedComment = _context4.sent;
          return _context4.abrupt("return", updatedComment);
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
  return function updateComment(_x9, _x0, _x1) {
    return _ref4.apply(this, arguments);
  };
}();
var deleteComment = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(commentId, userInfo) {
    var targetComment, deletedRepliesCount;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return _commentModel.commentModel.findOneById(commentId);
        case 3:
          targetComment = _context5.sent;
          if (targetComment) {
            _context5.next = 6;
            break;
          }
          throw new Error('Comment not found!');
        case 6:
          if (!(targetComment.userId.toString() !== userInfo._id.toString())) {
            _context5.next = 8;
            break;
          }
          throw new Error('You do not have permission to delete this comment!');
        case 8:
          if (!targetComment.parentId) {
            _context5.next = 17;
            break;
          }
          _context5.next = 11;
          return _commentModel.commentModel.deleteById(commentId);
        case 11:
          _context5.next = 13;
          return _commentModel.commentModel.decrementReplyCount(targetComment.parentId);
        case 13:
          _context5.next = 15;
          return _cardModel.cardModel.decrementTotalComments(targetComment.cardId, 1);
        case 15:
          _context5.next = 24;
          break;
        case 17:
          _context5.next = 19;
          return _commentModel.commentModel.deleteManyByParentId(commentId);
        case 19:
          deletedRepliesCount = _context5.sent;
          _context5.next = 22;
          return _commentModel.commentModel.deleteById(commentId);
        case 22:
          _context5.next = 24;
          return _cardModel.cardModel.decrementTotalComments(targetComment.cardId, 1 + deletedRepliesCount);
        case 24:
          return _context5.abrupt("return", {
            resultMessage: 'Comment deleted successfully!',
            cardId: targetComment.cardId.toString(),
            parentId: targetComment.parentId ? targetComment.parentId.toString() : null
          });
        case 27:
          _context5.prev = 27;
          _context5.t0 = _context5["catch"](0);
          throw _context5.t0;
        case 30:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 27]]);
  }));
  return function deleteComment(_x10, _x11) {
    return _ref5.apply(this, arguments);
  };
}();
var commentService = {
  createNew: createNew,
  getComments: getComments,
  getReplies: getReplies,
  updateComment: updateComment,
  deleteComment: deleteComment
};
exports.commentService = commentService;