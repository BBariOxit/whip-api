"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cardService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _cardModel = require("../models/cardModel");
var _columnModel = require("../models/columnModel");
var _CloudinaryProvider = require("../providers/CloudinaryProvider");
var _activityModel = require("../models/activityModel");
var _labelModel = require("../models/labelModel");
var _userModel = require("../models/userModel");
var _constants = require("../utils/constants");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// Helper: Ghi log activity vào DB (không throw error nếu fail để không block luồng chính)
var logActivity = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _activityModel.activityModel.createNew(data);
        case 3:
          _context.next = 8;
          break;
        case 5:
          _context.prev = 5;
          _context.t0 = _context["catch"](0);
          // eslint-disable-next-line no-console
          console.error('Failed to log activity:', _context.t0);
        case 8:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 5]]);
  }));
  return function logActivity(_x) {
    return _ref.apply(this, arguments);
  };
}();
var createNew = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(reqBody) {
    var newCard, createdCard, getNewCard;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          newCard = _objectSpread({}, reqBody);
          _context2.next = 4;
          return _cardModel.cardModel.createNew(newCard);
        case 4:
          createdCard = _context2.sent;
          _context2.next = 7;
          return _cardModel.cardModel.findOneById(createdCard.insertedId);
        case 7:
          getNewCard = _context2.sent;
          if (!getNewCard) {
            _context2.next = 11;
            break;
          }
          _context2.next = 11;
          return _columnModel.columnModel.pushCardOrderIds(getNewCard);
        case 11:
          return _context2.abrupt("return", getNewCard);
        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;
        case 17:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 14]]);
  }));
  return function createNew(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(cardId, reqBody, cardCoverFile, userInfo) {
    var updateData, fullUser, updatedCard, uploadResult, isAdd, cardBeforeUpdate, actionText, _actionText, _cardBeforeUpdate, _updatedCard, oldLabelIds, newLabelIds, addedLabelIds, removedLabelIds, _iterator, _step, labelId, label, labelName, _iterator2, _step2, _labelId, _label, _labelName;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          updateData = _objectSpread(_objectSpread({}, reqBody), {}, {
            updatedAt: Date.now()
          }); // Lookup user từ DB để lấy displayName (JWT token chỉ chứa _id và email)
          _context3.next = 4;
          return _userModel.userModel.findOneById(userInfo._id);
        case 4:
          fullUser = _context3.sent;
          updatedCard = {};
          if (!cardCoverFile) {
            _context3.next = 17;
            break;
          }
          _context3.next = 9;
          return _CloudinaryProvider.cloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers');
        case 9:
          uploadResult = _context3.sent;
          _context3.next = 12;
          return _cardModel.cardModel.update(cardId, {
            cover: uploadResult.secure_url
          });
        case 12:
          updatedCard = _context3.sent;
          _context3.next = 15;
          return logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: _constants.ACTIVITY_ACTION_TYPES.UPDATE_COVER,
            content: 'đã thay đổi ảnh bìa'
          });
        case 15:
          _context3.next = 89;
          break;
        case 17:
          if (!updateData.incomingMemberInfo) {
            _context3.next = 26;
            break;
          }
          _context3.next = 20;
          return _cardModel.cardModel.updateMembers(cardId, updateData.incomingMemberInfo);
        case 20:
          updatedCard = _context3.sent;
          // Log: Thêm/xóa thành viên
          isAdd = updateData.incomingMemberInfo.action === _constants.CARD_MEMBER_ACTIONS.ADD;
          _context3.next = 24;
          return logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: isAdd ? _constants.ACTIVITY_ACTION_TYPES.ADD_MEMBER : _constants.ACTIVITY_ACTION_TYPES.REMOVE_MEMBER,
            content: isAdd ? 'đã tham gia thẻ này' : 'đã rời khỏi thẻ này'
          });
        case 24:
          _context3.next = 89;
          break;
        case 26:
          // các trường hợp update chung như title, description, due date...
          // Lấy card hiện tại TRƯỚC khi update (để so sánh labelIds cũ vs mới)
          cardBeforeUpdate = null;
          if (!(updateData.labelIds !== undefined)) {
            _context3.next = 31;
            break;
          }
          _context3.next = 30;
          return _cardModel.cardModel.findOneById(cardId);
        case 30:
          cardBeforeUpdate = _context3.sent;
        case 31:
          _context3.next = 33;
          return _cardModel.cardModel.update(cardId, updateData);
        case 33:
          updatedCard = _context3.sent;
          if (!(updateData.dueComplete !== undefined)) {
            _context3.next = 38;
            break;
          }
          actionText = updateData.dueComplete ? 'đã đánh dấu hoàn thành' : 'đã bỏ đánh dấu hoàn thành';
          _context3.next = 38;
          return logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: _constants.ACTIVITY_ACTION_TYPES.UPDATE_DATE,
            content: actionText
          });
        case 38:
          if (!(updateData.dueDate !== undefined)) {
            _context3.next = 42;
            break;
          }
          _actionText = updateData.dueDate ? 'đã cập nhật deadline' : 'đã gỡ deadline';
          _context3.next = 42;
          return logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: _constants.ACTIVITY_ACTION_TYPES.SET_DATE,
            content: _actionText,
            metadata: updateData.dueDate ? {
              newDate: updateData.dueDate
            } : null
          });
        case 42:
          if (!(updateData.labelIds !== undefined && cardBeforeUpdate)) {
            _context3.next = 89;
            break;
          }
          oldLabelIds = (((_cardBeforeUpdate = cardBeforeUpdate) === null || _cardBeforeUpdate === void 0 ? void 0 : _cardBeforeUpdate.labelIds) || []).map(function (id) {
            return id.toString();
          });
          newLabelIds = (((_updatedCard = updatedCard) === null || _updatedCard === void 0 ? void 0 : _updatedCard.labelIds) || []).map(function (id) {
            return id.toString();
          }); // Tìm label mới được thêm
          addedLabelIds = newLabelIds.filter(function (id) {
            return !oldLabelIds.includes(id);
          }); // Tìm label bị xóa
          removedLabelIds = oldLabelIds.filter(function (id) {
            return !newLabelIds.includes(id);
          }); // Ghi log cho từng label được thêm (kèm tên label)
          _iterator = _createForOfIteratorHelper(addedLabelIds);
          _context3.prev = 48;
          _iterator.s();
        case 50:
          if ((_step = _iterator.n()).done) {
            _context3.next = 60;
            break;
          }
          labelId = _step.value;
          _context3.next = 54;
          return _labelModel.labelModel.findOneById(labelId);
        case 54:
          label = _context3.sent;
          labelName = (label === null || label === void 0 ? void 0 : label.title) || 'không tên';
          _context3.next = 58;
          return logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: _constants.ACTIVITY_ACTION_TYPES.ADD_LABEL,
            content: "\u0111\xE3 th\xEAm nh\xE3n \"".concat(labelName, "\"")
          });
        case 58:
          _context3.next = 50;
          break;
        case 60:
          _context3.next = 65;
          break;
        case 62:
          _context3.prev = 62;
          _context3.t0 = _context3["catch"](48);
          _iterator.e(_context3.t0);
        case 65:
          _context3.prev = 65;
          _iterator.f();
          return _context3.finish(65);
        case 68:
          // Ghi log cho từng label bị xóa (kèm tên label)
          _iterator2 = _createForOfIteratorHelper(removedLabelIds);
          _context3.prev = 69;
          _iterator2.s();
        case 71:
          if ((_step2 = _iterator2.n()).done) {
            _context3.next = 81;
            break;
          }
          _labelId = _step2.value;
          _context3.next = 75;
          return _labelModel.labelModel.findOneById(_labelId);
        case 75:
          _label = _context3.sent;
          _labelName = (_label === null || _label === void 0 ? void 0 : _label.title) || 'không tên';
          _context3.next = 79;
          return logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: _constants.ACTIVITY_ACTION_TYPES.REMOVE_LABEL,
            content: "\u0111\xE3 x\xF3a nh\xE3n \"".concat(_labelName, "\"")
          });
        case 79:
          _context3.next = 71;
          break;
        case 81:
          _context3.next = 86;
          break;
        case 83:
          _context3.prev = 83;
          _context3.t1 = _context3["catch"](69);
          _iterator2.e(_context3.t1);
        case 86:
          _context3.prev = 86;
          _iterator2.f();
          return _context3.finish(86);
        case 89:
          return _context3.abrupt("return", updatedCard);
        case 92:
          _context3.prev = 92;
          _context3.t2 = _context3["catch"](0);
          throw _context3.t2;
        case 95:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 92], [48, 62, 65, 68], [69, 83, 86, 89]]);
  }));
  return function update(_x3, _x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var uploadAttachment = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(cardId, file, userInfo) {
    var fullUser, uploadResult, originalFormat, attachment, updatedCard;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return _userModel.userModel.findOneById(userInfo._id);
        case 3:
          fullUser = _context4.sent;
          _context4.next = 6;
          return _CloudinaryProvider.cloudinaryProvider.streamUpload(file.buffer, 'card-attachments');
        case 6:
          uploadResult = _context4.sent;
          // Lấy format từ originalname (vì Cloudinary với raw file không trả về format)
          originalFormat = file.originalname.split('.').pop().toLowerCase(); // Tạo object attachment metadata
          attachment = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            filename: file.originalname,
            format: uploadResult.format || originalFormat,
            createdAt: Date.now()
          }; // Push attachment vào mảng attachments của card
          _context4.next = 11;
          return _cardModel.cardModel.pushNewAttachment(cardId, attachment);
        case 11:
          updatedCard = _context4.sent;
          _context4.next = 14;
          return logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: _constants.ACTIVITY_ACTION_TYPES.ADD_ATTACHMENT,
            content: "\u0111\xE3 \u0111\xEDnh k\xE8m \"".concat(file.originalname, "\"")
          });
        case 14:
          return _context4.abrupt("return", updatedCard);
        case 17:
          _context4.prev = 17;
          _context4.t0 = _context4["catch"](0);
          throw _context4.t0;
        case 20:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 17]]);
  }));
  return function uploadAttachment(_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}();
var deleteAttachment = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(cardId, publicId, userInfo) {
    var _currentCard$attachme, fullUser, currentCard, attachment, filename, updatedCard;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return _userModel.userModel.findOneById(userInfo._id);
        case 3:
          fullUser = _context5.sent;
          _context5.next = 6;
          return _cardModel.cardModel.findOneById(cardId);
        case 6:
          currentCard = _context5.sent;
          attachment = currentCard === null || currentCard === void 0 || (_currentCard$attachme = currentCard.attachments) === null || _currentCard$attachme === void 0 ? void 0 : _currentCard$attachme.find(function (att) {
            return att.publicId === publicId;
          });
          filename = (attachment === null || attachment === void 0 ? void 0 : attachment.filename) || 'file'; // Xóa file vật lý trên Cloudinary
          _context5.next = 11;
          return _CloudinaryProvider.cloudinaryProvider.deleteResource(publicId);
        case 11:
          _context5.next = 13;
          return _cardModel.cardModel.pullAttachment(cardId, publicId);
        case 13:
          updatedCard = _context5.sent;
          _context5.next = 16;
          return logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: _constants.ACTIVITY_ACTION_TYPES.REMOVE_ATTACHMENT,
            content: "\u0111\xE3 x\xF3a file \u0111\xEDnh k\xE8m \"".concat(filename, "\"")
          });
        case 16:
          return _context5.abrupt("return", updatedCard);
        case 19:
          _context5.prev = 19;
          _context5.t0 = _context5["catch"](0);
          throw _context5.t0;
        case 22:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 19]]);
  }));
  return function deleteAttachment(_x0, _x1, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(cardId, userInfo) {
    var targetCard, fullUser;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return _cardModel.cardModel.findOneById(cardId);
        case 3:
          targetCard = _context6.sent;
          if (targetCard) {
            _context6.next = 6;
            break;
          }
          throw new Error('Card not found!');
        case 6:
          _context6.next = 8;
          return _cardModel.cardModel.deleteOneById(cardId);
        case 8:
          _context6.next = 10;
          return _columnModel.columnModel.pullCardOrderIds(targetCard);
        case 10:
          _context6.next = 12;
          return _userModel.userModel.findOneById(userInfo._id);
        case 12:
          fullUser = _context6.sent;
          _context6.next = 15;
          return logActivity({
            cardId: cardId,
            // Có thể log ở cấp độ board nếu cardId đã mất
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: (fullUser === null || fullUser === void 0 ? void 0 : fullUser.displayName) || (fullUser === null || fullUser === void 0 ? void 0 : fullUser.username) || userInfo.email,
            actionType: 'DELETE_CARD',
            content: "\u0111\xE3 x\xF3a m\u1ED9t th\u1EBB \"".concat(targetCard.title, "\"")
          });
        case 15:
          return _context6.abrupt("return", {
            deleteResult: 'Card deleted successfully!'
          });
        case 18:
          _context6.prev = 18;
          _context6.t0 = _context6["catch"](0);
          throw _context6.t0;
        case 21:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 18]]);
  }));
  return function deleteItem(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();
var archiveCard = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(cardId, userInfo) {
    var targetCard;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return _cardModel.cardModel.findOneById(cardId);
        case 3:
          targetCard = _context7.sent;
          if (targetCard) {
            _context7.next = 6;
            break;
          }
          throw new Error('Card not found!');
        case 6:
          _context7.next = 8;
          return _cardModel.cardModel.archiveCard(cardId);
        case 8:
          _context7.next = 10;
          return _columnModel.columnModel.pullCardOrderIds(targetCard);
        case 10:
          return _context7.abrupt("return", {
            archiveResult: 'Card archived successfully!'
          });
        case 13:
          _context7.prev = 13;
          _context7.t0 = _context7["catch"](0);
          throw _context7.t0;
        case 16:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 13]]);
  }));
  return function archiveCard(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();
var restoreCard = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(cardId, newColumnId) {
    var targetCard, restoredCard, pushData;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return _cardModel.cardModel.findOneById(cardId);
        case 3:
          targetCard = _context8.sent;
          if (targetCard) {
            _context8.next = 6;
            break;
          }
          throw new Error('Card not found!');
        case 6:
          _context8.next = 8;
          return _cardModel.cardModel.restoreCard(cardId, newColumnId);
        case 8:
          restoredCard = _context8.sent;
          // Thêm lại cardId vào mảng cardOrderIds của Column chứa nó (hoặc cột mới nếu có)
          pushData = {
            _id: restoredCard._id,
            columnId: restoredCard.columnId
          };
          _context8.next = 12;
          return _columnModel.columnModel.pushCardOrderIds(pushData);
        case 12:
          return _context8.abrupt("return", restoredCard);
        case 15:
          _context8.prev = 15;
          _context8.t0 = _context8["catch"](0);
          throw _context8.t0;
        case 18:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 15]]);
  }));
  return function restoreCard(_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}();

// ===== TEMPLATE SERVICES =====
var saveAsTemplate = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(cardId) {
    var template;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return _cardModel.cardModel.saveAsTemplate(cardId);
        case 3:
          template = _context9.sent;
          return _context9.abrupt("return", template);
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
  return function saveAsTemplate(_x17) {
    return _ref9.apply(this, arguments);
  };
}();
var getTemplatesByBoardId = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(boardId) {
    var templates;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _context0.next = 3;
          return _cardModel.cardModel.getTemplatesByBoardId(boardId);
        case 3:
          templates = _context0.sent;
          return _context0.abrupt("return", templates);
        case 7:
          _context0.prev = 7;
          _context0.t0 = _context0["catch"](0);
          throw _context0.t0;
        case 10:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 7]]);
  }));
  return function getTemplatesByBoardId(_x18) {
    return _ref0.apply(this, arguments);
  };
}();
var useTemplate = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(templateId, targetColumnId) {
    var newCard;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          _context1.next = 3;
          return _cardModel.cardModel.useTemplate(templateId, targetColumnId);
        case 3:
          newCard = _context1.sent;
          if (!newCard) {
            _context1.next = 7;
            break;
          }
          _context1.next = 7;
          return _columnModel.columnModel.pushCardOrderIds(newCard);
        case 7:
          return _context1.abrupt("return", newCard);
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
  return function useTemplate(_x19, _x20) {
    return _ref1.apply(this, arguments);
  };
}();
var deleteTemplate = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(templateId) {
    var result;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _context10.next = 3;
          return _cardModel.cardModel.deleteTemplate(templateId);
        case 3:
          result = _context10.sent;
          return _context10.abrupt("return", result);
        case 7:
          _context10.prev = 7;
          _context10.t0 = _context10["catch"](0);
          throw _context10.t0;
        case 10:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 7]]);
  }));
  return function deleteTemplate(_x21) {
    return _ref10.apply(this, arguments);
  };
}();
var duplicateCard = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(cardId, targetColumnId) {
    var newCard;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          _context11.next = 3;
          return _cardModel.cardModel.duplicateCard(cardId, targetColumnId);
        case 3:
          newCard = _context11.sent;
          if (!newCard) {
            _context11.next = 7;
            break;
          }
          _context11.next = 7;
          return _columnModel.columnModel.pushCardOrderIds(newCard);
        case 7:
          return _context11.abrupt("return", newCard);
        case 10:
          _context11.prev = 10;
          _context11.t0 = _context11["catch"](0);
          throw _context11.t0;
        case 13:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 10]]);
  }));
  return function duplicateCard(_x22, _x23) {
    return _ref11.apply(this, arguments);
  };
}();
var cardService = {
  createNew: createNew,
  update: update,
  uploadAttachment: uploadAttachment,
  deleteAttachment: deleteAttachment,
  deleteItem: deleteItem,
  archiveCard: archiveCard,
  restoreCard: restoreCard,
  saveAsTemplate: saveAsTemplate,
  getTemplatesByBoardId: getTemplatesByBoardId,
  useTemplate: useTemplate,
  deleteTemplate: deleteTemplate,
  duplicateCard: duplicateCard
};
exports.cardService = cardService;