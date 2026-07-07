"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workspaceService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _workspaceModel = require("../models/workspaceModel");
var _boardModel = require("../models/boardModel");
var _boardService = require("./boardService");
var _userModel = require("../models/userModel");
var _invitationModel = require("../models/invitationModel");
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _constants = require("../utils/constants");
var _mongodb = require("../config/mongodb");
var _mongodb2 = require("mongodb");
var _crypto = _interopRequireDefault(require("crypto"));
var _environment = require("../config/environment");
var _brevoProvider = require("../providers/brevoProvider");
var _CloudinaryProvider = require("../providers/CloudinaryProvider");
var _notificationService = require("./notificationService");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(userId, email, reqBody) {
    var createdWorkspace, getNewWorkspace;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _workspaceModel.workspaceModel.createNew(userId, email, reqBody);
        case 3:
          createdWorkspace = _context.sent;
          _context.next = 6;
          return _workspaceModel.workspaceModel.findById(createdWorkspace.insertedId);
        case 6:
          getNewWorkspace = _context.sent;
          return _context.abrupt("return", getNewWorkspace);
        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          throw _context.t0;
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
var getWorkspacesByUserId = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(userId) {
    var workspaces;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return _workspaceModel.workspaceModel.getWorkspacesByUserId(userId);
        case 3:
          workspaces = _context2.sent;
          return _context2.abrupt("return", workspaces);
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
  return function getWorkspacesByUserId(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

// Lấy workspace detail kèm thông tin user đầy đủ (populated members)
var getDetails = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(workspaceId) {
    var workspace;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return _workspaceModel.workspaceModel.getDetailsWithMembers(workspaceId);
        case 3:
          workspace = _context3.sent;
          if (workspace) {
            _context3.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 6:
          return _context3.abrupt("return", workspace);
        case 9:
          _context3.prev = 9;
          _context3.t0 = _context3["catch"](0);
          throw _context3.t0;
        case 12:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 9]]);
  }));
  return function getDetails(_x5) {
    return _ref3.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(userId, workspaceId) {
    var targetWorkspace, ownerMember, boards, _iterator, _step, board;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return _workspaceModel.workspaceModel.findById(workspaceId);
        case 3:
          targetWorkspace = _context4.sent;
          if (targetWorkspace) {
            _context4.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 6:
          // Double-check: Chỉ Owner mới được xóa workspace
          ownerMember = targetWorkspace.members.find(function (m) {
            return m.userId && m.userId.toString() === userId.toString() && m.role === _constants.WORKSPACE_ROLES.OWNER;
          });
          if (ownerMember) {
            _context4.next = 9;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Only the workspace owner can delete this workspace!');
        case 9:
          _context4.next = 11;
          return _boardModel.boardModel.findByWorkspaceId(workspaceId);
        case 11:
          boards = _context4.sent;
          // Loop through each board and delete it (cascade: xóa columns + cards)
          // Owner xoá workspace → luôn là 'admin' đối với mọi board
          _iterator = _createForOfIteratorHelper(boards);
          _context4.prev = 13;
          _iterator.s();
        case 15:
          if ((_step = _iterator.n()).done) {
            _context4.next = 21;
            break;
          }
          board = _step.value;
          _context4.next = 19;
          return _boardService.boardService.deleteItem(board._id.toString(), 'admin');
        case 19:
          _context4.next = 15;
          break;
        case 21:
          _context4.next = 26;
          break;
        case 23:
          _context4.prev = 23;
          _context4.t0 = _context4["catch"](13);
          _iterator.e(_context4.t0);
        case 26:
          _context4.prev = 26;
          _iterator.f();
          return _context4.finish(26);
        case 29:
          _context4.next = 31;
          return _workspaceModel.workspaceModel.deleteOneById(workspaceId);
        case 31:
          return _context4.abrupt("return", {
            deleteResult: 'Workspace and all related Boards deleted successfully!'
          });
        case 34:
          _context4.prev = 34;
          _context4.t1 = _context4["catch"](0);
          throw _context4.t1;
        case 37:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 34], [13, 23, 26, 29]]);
  }));
  return function deleteItem(_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(workspaceId, reqBody) {
    var ALLOWED_FIELDS, updateData, _i, _ALLOWED_FIELDS, field, updatedWorkspace;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          // Chỉ cho phép cập nhật các field an toàn (tránh mass-assignment: _destroy, members, ...)
          ALLOWED_FIELDS = ['title', 'description', 'visibility', 'invitePermission', 'boardCreation', 'boardDeletion'];
          updateData = {
            updatedAt: Date.now()
          };
          for (_i = 0, _ALLOWED_FIELDS = ALLOWED_FIELDS; _i < _ALLOWED_FIELDS.length; _i++) {
            field = _ALLOWED_FIELDS[_i];
            if (reqBody[field] !== undefined) updateData[field] = reqBody[field];
          }
          _context5.next = 6;
          return _workspaceModel.workspaceModel.update(workspaceId, updateData);
        case 6:
          updatedWorkspace = _context5.sent;
          return _context5.abrupt("return", updatedWorkspace);
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
  return function update(_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Chuyển quyền sở hữu workspace cho một member khác
 *
 * EDGE CASES:
 * 1. Không thể transfer cho chính mình
 * 2. Chỉ owner hiện tại mới được transfer
 * 3. Target phải là member active của workspace
 */
var transferOwnership = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(actorUserId, workspaceId, newOwnerUserId) {
    var workspace, actorMember, targetMember, updatedWorkspace;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          if (!(actorUserId.toString() === newOwnerUserId.toString())) {
            _context6.next = 3;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'You are already the owner of this workspace.');
        case 3:
          _context6.next = 5;
          return _workspaceModel.workspaceModel.findById(workspaceId);
        case 5:
          workspace = _context6.sent;
          if (workspace) {
            _context6.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 8:
          // Actor phải là owner hiện tại
          actorMember = workspace.members.find(function (m) {
            return m.userId && m.userId.toString() === actorUserId.toString();
          });
          if (!(!actorMember || actorMember.role !== _constants.WORKSPACE_ROLES.OWNER)) {
            _context6.next = 11;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Only the workspace owner can transfer ownership.');
        case 11:
          // Target phải là member active (không phải pending, không phải chính actor)
          targetMember = workspace.members.find(function (m) {
            return m.userId && m.userId.toString() === newOwnerUserId.toString();
          });
          if (targetMember) {
            _context6.next = 14;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'The selected user is not a member of this workspace!');
        case 14:
          if (!(targetMember.status !== 'active')) {
            _context6.next = 16;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'You can only transfer ownership to an active member.');
        case 16:
          _context6.next = 18;
          return _workspaceModel.workspaceModel.transferOwnership(workspaceId, actorUserId, newOwnerUserId);
        case 18:
          updatedWorkspace = _context6.sent;
          return _context6.abrupt("return", updatedWorkspace);
        case 22:
          _context6.prev = 22;
          _context6.t0 = _context6["catch"](0);
          throw _context6.t0;
        case 25:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 22]]);
  }));
  return function transferOwnership(_x0, _x1, _x10) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Cập nhật tuỳ chọn thông báo cá nhân của user trong 1 workspace.
 * Ai cũng chỉnh được prefs CỦA CHÍNH MÌNH (không phải quyền admin).
 */
var updateNotificationPrefs = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(userId, workspaceId, prefs) {
    var workspace, member, mergedPrefs, updatedWorkspace;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return _workspaceModel.workspaceModel.findById(workspaceId);
        case 3:
          workspace = _context7.sent;
          if (workspace) {
            _context7.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 6:
          member = workspace.members.find(function (m) {
            return m.userId && m.userId.toString() === userId.toString();
          });
          if (member) {
            _context7.next = 9;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'You are not a member of this workspace!');
        case 9:
          // Gộp: mặc định -> prefs đang lưu -> prefs mới gửi lên (đảm bảo object luôn đủ 5 key)
          mergedPrefs = _objectSpread(_objectSpread(_objectSpread({}, _workspaceModel.workspaceModel.DEFAULT_NOTIFICATION_PREFS), member.notificationPrefs || {}), prefs);
          _context7.next = 12;
          return _workspaceModel.workspaceModel.updateMemberNotificationPrefs(workspaceId, userId, mergedPrefs);
        case 12:
          updatedWorkspace = _context7.sent;
          return _context7.abrupt("return", updatedWorkspace);
        case 16:
          _context7.prev = 16;
          _context7.t0 = _context7["catch"](0);
          throw _context7.t0;
        case 19:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 16]]);
  }));
  return function updateNotificationPrefs(_x11, _x12, _x13) {
    return _ref7.apply(this, arguments);
  };
}();

/**
 * Upload / cập nhật logo workspace (Cloudinary)
 */
var updateLogo = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(workspaceId, logoFile) {
    var uploadResult, updatedWorkspace;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          if (logoFile) {
            _context8.next = 3;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'No logo file provided!');
        case 3:
          _context8.next = 5;
          return _CloudinaryProvider.cloudinaryProvider.streamUpload(logoFile.buffer, 'workspaces');
        case 5:
          uploadResult = _context8.sent;
          _context8.next = 8;
          return _workspaceModel.workspaceModel.update(workspaceId, {
            logo: uploadResult.secure_url,
            updatedAt: Date.now()
          });
        case 8:
          updatedWorkspace = _context8.sent;
          return _context8.abrupt("return", updatedWorkspace);
        case 12:
          _context8.prev = 12;
          _context8.t0 = _context8["catch"](0);
          throw _context8.t0;
        case 15:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 12]]);
  }));
  return function updateLogo(_x14, _x15) {
    return _ref8.apply(this, arguments);
  };
}();

/**
 * Mời member mới vào workspace qua email (Pending status)
 */
var inviteMember = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(inviterId, workspaceId, reqBody) {
    var inviteeEmail, role, workspace, actor, existingMember, inviteToken, memberRole, existingUser, newPendingUserId, db, newPendingMember, websiteDomain, inviteLink, subject, htmlContent;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          inviteeEmail = reqBody.inviteeEmail, role = reqBody.role;
          _context9.next = 4;
          return _workspaceModel.workspaceModel.findById(workspaceId);
        case 4:
          workspace = _context9.sent;
          if (workspace) {
            _context9.next = 7;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 7:
          if (!(workspace.invitePermission !== 'all')) {
            _context9.next = 11;
            break;
          }
          actor = workspace.members.find(function (m) {
            var _m$userId;
            return ((_m$userId = m.userId) === null || _m$userId === void 0 ? void 0 : _m$userId.toString()) === inviterId.toString() && m.status === 'active';
          });
          if (!((actor === null || actor === void 0 ? void 0 : actor.role) === _constants.WORKSPACE_ROLES.MEMBER)) {
            _context9.next = 11;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Only Owner and Admin can invite members in this workspace.');
        case 11:
          // 1. Check xem user đã ở trong Workspace chưa?
          existingMember = workspace.members.find(function (m) {
            return m.email === inviteeEmail;
          });
          if (!existingMember) {
            _context9.next = 17;
            break;
          }
          if (!(existingMember.status === 'active')) {
            _context9.next = 15;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.CONFLICT, 'This user is already an active member of this workspace!');
        case 15:
          if (!(existingMember.status === 'pending')) {
            _context9.next = 17;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.CONFLICT, 'An invitation has already been sent to this email!');
        case 17:
          // 2. Tạo Token độc nhất
          inviteToken = _crypto["default"].randomBytes(32).toString('hex'); // 3. Chuẩn bị pending member data
          memberRole = role || _constants.WORKSPACE_ROLES.MEMBER; // Lấy user object nếu user đã có tài khoản (để có thể gắn userId ngay nếu muốn, nhưng ở đây theo AI suggest, có thể set null)
          // Nhưng tối ưu hơn: nếu có user, gắn userId luôn, chỉ để status pending.
          _context9.next = 21;
          return _userModel.userModel.findOneByEmail(inviteeEmail);
        case 21:
          existingUser = _context9.sent;
          newPendingUserId = existingUser ? existingUser._id : null;
          db = (0, _mongodb.GET_DB)();
          newPendingMember = {
            userId: newPendingUserId,
            email: inviteeEmail,
            role: memberRole,
            status: 'pending',
            inviteToken: inviteToken,
            joinedAt: Date.now()
          }; // 4. Nhét vào database
          _context9.next = 27;
          return db.collection(_workspaceModel.workspaceModel.WORKSPACE_COLLECTION_NAME).updateOne({
            _id: new _mongodb2.ObjectId(workspaceId)
          }, {
            $push: {
              members: newPendingMember
            }
          });
        case 27:
          // 5. BẮN EMAIL BẰNG BREVO
          websiteDomain = _environment.env.BUILD_MODE === 'dev' ? _environment.env.WEBSITE_DOMAIN_DEVELOPMENT : _environment.env.WEBSITE_DOMAIN_PRODUCTION;
          inviteLink = "".concat(websiteDomain, "/accept-invite?token=").concat(inviteToken, "&workspaceId=").concat(workspaceId);
          subject = "You are invited to join the Workspace: ".concat(workspace.title);
          htmlContent = "\n      <h3>Hello,</h3>\n      <p>You have been invited to join the workspace <strong>".concat(workspace.title, "</strong> on Whip.</p>\n      <p>Click the link below to accept the invitation:</p>\n      <a href=\"").concat(inviteLink, "\" style=\"display:inline-block;padding:10px 20px;background-color:#238636;color:#fff;text-decoration:none;border-radius:4px;\">Accept Invitation</a>\n      <p>If you don't have an account, you will need to create one first.</p>\n    ");
          _context9.prev = 31;
          _context9.next = 34;
          return _brevoProvider.brevoProvider.sendEmail(inviteeEmail, subject, htmlContent);
        case 34:
          _context9.next = 39;
          break;
        case 36:
          _context9.prev = 36;
          _context9.t0 = _context9["catch"](31);
          console.error('Lỗi khi gửi email mời qua Brevo:', _context9.t0);
          // Optional: rollback if email fails, but usually we just warn.
        case 39:
          return _context9.abrupt("return", {
            message: 'Invitation sent successfully!',
            newMember: newPendingMember
          });
        case 42:
          _context9.prev = 42;
          _context9.t1 = _context9["catch"](0);
          throw _context9.t1;
        case 45:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 42], [31, 36]]);
  }));
  return function inviteMember(_x16, _x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}();

/**
 * Accept invite
 */
var acceptInvite = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(userId, userEmail, token, workspaceId) {
    var workspace, pendingMember, existingActiveMemberIds;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          _context0.next = 3;
          return _workspaceModel.workspaceModel.findById(workspaceId);
        case 3:
          workspace = _context0.sent;
          if (workspace) {
            _context0.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 6:
          pendingMember = workspace.members.find(function (m) {
            return m.inviteToken === token;
          });
          if (pendingMember) {
            _context0.next = 9;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Invalid or expired invitation token!');
        case 9:
          if (!(pendingMember.email !== userEmail)) {
            _context0.next = 11;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'This invitation is not for your email address!');
        case 11:
          _context0.next = 13;
          return _workspaceModel.workspaceModel.acceptInviteMember(workspaceId, token, userId);
        case 13:
          // Báo cho các thành viên hiện có: có người mới tham gia (email, best-effort — không chặn)
          existingActiveMemberIds = workspace.members.filter(function (m) {
            return m.userId && m.status === 'active';
          }).map(function (m) {
            return m.userId.toString();
          });
          _notificationService.notificationService.dispatch({
            type: _constants.NOTIFICATION_TYPES.MEMBER_JOINED,
            workspaceId: workspaceId,
            recipientIds: existingActiveMemberIds,
            actorId: userId,
            context: {
              workspaceTitle: workspace.title
            }
          });
          return _context0.abrupt("return", {
            message: 'Invitation accepted successfully!',
            workspaceId: workspaceId
          });
        case 18:
          _context0.prev = 18;
          _context0.t0 = _context0["catch"](0);
          throw _context0.t0;
        case 21:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 18]]);
  }));
  return function acceptInvite(_x19, _x20, _x21, _x22) {
    return _ref0.apply(this, arguments);
  };
}();

/**
 * Kick/Remove member khỏi workspace
 * 
 * EDGE CASES (Bức tường thép):
 * 1. Admin không được kick Owner → 403
 * 2. Không được tự kick chính mình → 400 (dùng leaveWorkspace thay thế)
 * 3. Admin không được kick Admin khác (chỉ Owner mới kick Admin)
 * 4. CASCADE: Khi kick, gỡ user khỏi tất cả boards trong workspace
 */
var removeMember = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(actorUserId, workspaceId, targetUserId) {
    var workspace, actorMember, actorRole, targetMember, targetRole, updatedWorkspace, workspaceOwner;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          if (!(actorUserId.toString() === targetUserId.toString())) {
            _context1.next = 3;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'You cannot kick yourself. Use Leave Workspace instead.');
        case 3:
          _context1.next = 5;
          return _workspaceModel.workspaceModel.findById(workspaceId);
        case 5:
          workspace = _context1.sent;
          if (workspace) {
            _context1.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 8:
          // Tìm role của actor (người bấm kick)
          actorMember = workspace.members.find(function (m) {
            return m.userId && m.userId.toString() === actorUserId.toString();
          });
          actorRole = actorMember === null || actorMember === void 0 ? void 0 : actorMember.role; // Tìm role của target (người bị kick), vì có thể pending nên xóa bằng userId hoặc email
          targetMember = workspace.members.find(function (m) {
            return m.userId && m.userId.toString() === targetUserId.toString() || m.email === targetUserId;
          });
          if (targetMember) {
            _context1.next = 13;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Target user is not a member of this workspace!');
        case 13:
          targetRole = targetMember.role; // BỨC TƯỜNG THÉP NGHIỆP VỤ
          if (!(targetRole === _constants.WORKSPACE_ROLES.OWNER)) {
            _context1.next = 16;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Cannot remove the workspace owner!');
        case 16:
          if (!(actorRole === _constants.WORKSPACE_ROLES.ADMIN && targetRole === _constants.WORKSPACE_ROLES.ADMIN)) {
            _context1.next = 18;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Admins cannot remove other admins. Only the owner can do this.');
        case 18:
          _context1.next = 20;
          return _workspaceModel.workspaceModel.removeMember(workspaceId, targetUserId);
        case 20:
          updatedWorkspace = _context1.sent;
          workspaceOwner = workspace.members.find(function (m) {
            return m.role === _constants.WORKSPACE_ROLES.OWNER;
          }); // CASCADE: Gỡ user khỏi tất cả boards trong workspace (Chỉ cần làm nếu user đã có tài khoản thực sự)
          if (!(targetMember.userId && workspaceOwner && workspaceOwner.userId)) {
            _context1.next = 25;
            break;
          }
          _context1.next = 25;
          return cascadeRemoveUserFromBoards(workspaceId, targetMember.userId.toString(), workspaceOwner.userId.toString());
        case 25:
          return _context1.abrupt("return", updatedWorkspace);
        case 28:
          _context1.prev = 28;
          _context1.t0 = _context1["catch"](0);
          throw _context1.t0;
        case 31:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[0, 28]]);
  }));
  return function removeMember(_x23, _x24, _x25) {
    return _ref1.apply(this, arguments);
  };
}();

/**
 * Cập nhật role của member trong workspace
 * 
 * EDGE CASES:
 * 1. Không ai được thay đổi role của Owner
 * 2. Admin không được nâng người khác lên Owner
 * 3. Không được tự đổi role chính mình
 * 4. Admin không được đổi role Admin khác (chỉ Owner mới được)
 */
var updateMemberRole = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(actorUserId, workspaceId, targetUserId, newRole) {
    var workspace, actorMember, actorRole, targetMember, targetRole, updatedWorkspace;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          if (!(actorUserId.toString() === targetUserId.toString())) {
            _context10.next = 3;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'You cannot change your own role.');
        case 3:
          _context10.next = 5;
          return _workspaceModel.workspaceModel.findById(workspaceId);
        case 5:
          workspace = _context10.sent;
          if (workspace) {
            _context10.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 8:
          actorMember = workspace.members.find(function (m) {
            return m.userId && m.userId.toString() === actorUserId.toString();
          });
          actorRole = actorMember === null || actorMember === void 0 ? void 0 : actorMember.role;
          targetMember = workspace.members.find(function (m) {
            return m.userId && m.userId.toString() === targetUserId.toString() || m.email === targetUserId;
          });
          if (targetMember) {
            _context10.next = 13;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Target user is not a member of this workspace!');
        case 13:
          targetRole = targetMember.role; // Không ai được thay đổi role của Owner
          if (!(targetRole === _constants.WORKSPACE_ROLES.OWNER)) {
            _context10.next = 16;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Cannot change the role of the workspace owner!');
        case 16:
          if (!(actorRole === _constants.WORKSPACE_ROLES.ADMIN && targetRole === _constants.WORKSPACE_ROLES.ADMIN)) {
            _context10.next = 18;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Admins cannot change roles of other admins.');
        case 18:
          _context10.next = 20;
          return _workspaceModel.workspaceModel.updateMemberRole(workspaceId, targetUserId, newRole);
        case 20:
          updatedWorkspace = _context10.sent;
          return _context10.abrupt("return", updatedWorkspace);
        case 24:
          _context10.prev = 24;
          _context10.t0 = _context10["catch"](0);
          throw _context10.t0;
        case 27:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 24]]);
  }));
  return function updateMemberRole(_x26, _x27, _x28, _x29) {
    return _ref10.apply(this, arguments);
  };
}();

/**
 * Tự rời khỏi workspace
 * 
 * EDGE CASES:
 * 1. Owner KHÔNG ĐƯỢC leave (phải transfer ownership trước — hiện chưa hỗ trợ)
 * 2. CASCADE: Khi leave, gỡ user khỏi tất cả boards trong workspace
 */
var leaveWorkspace = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(userId, workspaceId) {
    var workspace, memberInfo, updatedWorkspace, workspaceOwner;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          _context11.next = 3;
          return _workspaceModel.workspaceModel.findById(workspaceId);
        case 3:
          workspace = _context11.sent;
          if (workspace) {
            _context11.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 6:
          memberInfo = workspace.members.find(function (m) {
            return m.userId && m.userId.toString() === userId.toString();
          });
          if (memberInfo) {
            _context11.next = 9;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'You are not a member of this workspace!');
        case 9:
          if (!(memberInfo.role === _constants.WORKSPACE_ROLES.OWNER)) {
            _context11.next = 11;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'The workspace owner cannot leave. Transfer ownership first or delete the workspace.');
        case 11:
          _context11.next = 13;
          return _workspaceModel.workspaceModel.removeMember(workspaceId, userId);
        case 13:
          updatedWorkspace = _context11.sent;
          workspaceOwner = workspace.members.find(function (m) {
            return m.role === _constants.WORKSPACE_ROLES.OWNER;
          }); // CASCADE: Gỡ user khỏi tất cả boards trong workspace
          if (!(workspaceOwner && workspaceOwner.userId)) {
            _context11.next = 18;
            break;
          }
          _context11.next = 18;
          return cascadeRemoveUserFromBoards(workspaceId, userId, workspaceOwner.userId.toString());
        case 18:
          return _context11.abrupt("return", updatedWorkspace);
        case 21:
          _context11.prev = 21;
          _context11.t0 = _context11["catch"](0);
          throw _context11.t0;
        case 24:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 21]]);
  }));
  return function leaveWorkspace(_x30, _x31) {
    return _ref11.apply(this, arguments);
  };
}();

/**
 * Lấy danh sách members với thông tin user đầy đủ (email, displayName, avatar)
 */
var getMembers = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee12(workspaceId) {
    var workspace;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          _context12.next = 3;
          return _workspaceModel.workspaceModel.getDetailsWithMembers(workspaceId);
        case 3:
          workspace = _context12.sent;
          if (workspace) {
            _context12.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Workspace not found!');
        case 6:
          return _context12.abrupt("return", workspace.members || []);
        case 9:
          _context12.prev = 9;
          _context12.t0 = _context12["catch"](0);
          throw _context12.t0;
        case 12:
        case "end":
          return _context12.stop();
      }
    }, _callee12, null, [[0, 9]]);
  }));
  return function getMembers(_x32) {
    return _ref12.apply(this, arguments);
  };
}();

/**
 * CASCADE: Gỡ user khỏi tất cả boards thuộc workspace
 * Được gọi khi kick member hoặc member leave workspace
 */
var cascadeRemoveUserFromBoards = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee13(workspaceId, userId, workspaceOwnerId) {
    var db, userObjectId, ownerObjectId, boardCollection, ownedBoards, _iterator2, _step2, board;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          db = (0, _mongodb.GET_DB)();
          userObjectId = new _mongodb2.ObjectId(userId);
          ownerObjectId = new _mongodb2.ObjectId(workspaceOwnerId);
          boardCollection = db.collection(_boardModel.boardModel.BOARD_COLLECTION_NAME); // 1. Đối với các board mà user bị xóa/rời đi ĐANG LÀ OWNER:
          // Gỡ user khỏi ownerIds và NHÉT workspaceOwner vào làm owner thay thế
          _context13.next = 7;
          return boardCollection.find({
            workspaceId: new _mongodb2.ObjectId(workspaceId),
            ownerIds: userObjectId
          }).toArray();
        case 7:
          ownedBoards = _context13.sent;
          _iterator2 = _createForOfIteratorHelper(ownedBoards);
          _context13.prev = 9;
          _iterator2.s();
        case 11:
          if ((_step2 = _iterator2.n()).done) {
            _context13.next = 17;
            break;
          }
          board = _step2.value;
          _context13.next = 15;
          return boardCollection.updateOne({
            _id: board._id
          }, {
            $pull: {
              ownerIds: userObjectId
            },
            $addToSet: {
              ownerIds: ownerObjectId,
              memberIds: ownerObjectId
            }
          });
        case 15:
          _context13.next = 11;
          break;
        case 17:
          _context13.next = 22;
          break;
        case 19:
          _context13.prev = 19;
          _context13.t0 = _context13["catch"](9);
          _iterator2.e(_context13.t0);
        case 22:
          _context13.prev = 22;
          _iterator2.f();
          return _context13.finish(22);
        case 25:
          _context13.next = 27;
          return boardCollection.updateMany({
            workspaceId: new _mongodb2.ObjectId(workspaceId)
          }, {
            $pull: {
              memberIds: userObjectId,
              ownerIds: userObjectId
            }
          });
        case 27:
          _context13.next = 32;
          break;
        case 29:
          _context13.prev = 29;
          _context13.t1 = _context13["catch"](0);
          console.error('Error in cascadeRemoveUserFromBoards:', _context13.t1.message);
          // Không throw — cascade failure không nên block main operation
        case 32:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[0, 29], [9, 19, 22, 25]]);
  }));
  return function cascadeRemoveUserFromBoards(_x33, _x34, _x35) {
    return _ref13.apply(this, arguments);
  };
}();
var workspaceService = {
  createNew: createNew,
  getWorkspacesByUserId: getWorkspacesByUserId,
  getDetails: getDetails,
  deleteItem: deleteItem,
  update: update,
  inviteMember: inviteMember,
  acceptInvite: acceptInvite,
  removeMember: removeMember,
  updateMemberRole: updateMemberRole,
  leaveWorkspace: leaveWorkspace,
  getMembers: getMembers,
  transferOwnership: transferOwnership,
  updateLogo: updateLogo,
  updateNotificationPrefs: updateNotificationPrefs
};
exports.workspaceService = workspaceService;