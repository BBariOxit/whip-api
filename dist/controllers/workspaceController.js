"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workspaceController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _workspaceService = require("../services/workspaceService");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var userId, email, createdWorkspace;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          userId = req.jwtDecoded._id;
          email = req.jwtDecoded.email;
          _context.next = 5;
          return _workspaceService.workspaceService.createNew(userId, email, req.body);
        case 5:
          createdWorkspace = _context.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(createdWorkspace);
          _context.next = 12;
          break;
        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          next(_context.t0);
        case 12:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 9]]);
  }));
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var getWorkspacesByUserId = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var userId, workspaces;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          userId = req.jwtDecoded._id;
          _context2.next = 4;
          return _workspaceService.workspaceService.getWorkspacesByUserId(userId);
        case 4:
          workspaces = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(workspaces);
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
  return function getWorkspacesByUserId(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var getDetails = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var workspaceId, workspace;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          workspaceId = req.params.id;
          _context3.next = 4;
          return _workspaceService.workspaceService.getDetails(workspaceId);
        case 4:
          workspace = _context3.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(workspace);
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
  return function getDetails(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var deleteItem = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var userId, workspaceId, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          userId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          _context4.next = 5;
          return _workspaceService.workspaceService.deleteItem(userId, workspaceId);
        case 5:
          result = _context4.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context4.next = 12;
          break;
        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](0);
          next(_context4.t0);
        case 12:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 9]]);
  }));
  return function deleteItem(_x0, _x1, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var workspaceId, updatedWorkspace;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          workspaceId = req.params.id;
          _context5.next = 4;
          return _workspaceService.workspaceService.update(workspaceId, req.body);
        case 4:
          updatedWorkspace = _context5.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedWorkspace);
          _context5.next = 11;
          break;
        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          next(_context5.t0);
        case 11:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 8]]);
  }));
  return function update(_x11, _x12, _x13) {
    return _ref5.apply(this, arguments);
  };
}();
var inviteMember = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var inviterId, workspaceId, result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          inviterId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          _context6.next = 5;
          return _workspaceService.workspaceService.inviteMember(inviterId, workspaceId, req.body);
        case 5:
          result = _context6.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context6.next = 12;
          break;
        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          next(_context6.t0);
        case 12:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 9]]);
  }));
  return function inviteMember(_x14, _x15, _x16) {
    return _ref6.apply(this, arguments);
  };
}();
var acceptInvite = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var userId, userEmail, _req$body, token, workspaceId, result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          userId = req.jwtDecoded._id;
          userEmail = req.jwtDecoded.email;
          _req$body = req.body, token = _req$body.token, workspaceId = _req$body.workspaceId;
          if (!(!token || !workspaceId)) {
            _context7.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Token and workspaceId are required!');
        case 6:
          _context7.next = 8;
          return _workspaceService.workspaceService.acceptInvite(userId, userEmail, token, workspaceId);
        case 8:
          result = _context7.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context7.next = 15;
          break;
        case 12:
          _context7.prev = 12;
          _context7.t0 = _context7["catch"](0);
          next(_context7.t0);
        case 15:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 12]]);
  }));
  return function acceptInvite(_x17, _x18, _x19) {
    return _ref7.apply(this, arguments);
  };
}();
var removeMember = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var actorUserId, workspaceId, targetUserId, result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          actorUserId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          targetUserId = req.params.targetUserId;
          _context8.next = 6;
          return _workspaceService.workspaceService.removeMember(actorUserId, workspaceId, targetUserId);
        case 6:
          result = _context8.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context8.next = 13;
          break;
        case 10:
          _context8.prev = 10;
          _context8.t0 = _context8["catch"](0);
          next(_context8.t0);
        case 13:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 10]]);
  }));
  return function removeMember(_x20, _x21, _x22) {
    return _ref8.apply(this, arguments);
  };
}();
var updateMemberRole = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var actorUserId, workspaceId, targetUserId, role, result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          actorUserId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          targetUserId = req.params.targetUserId;
          role = req.body.role;
          _context9.next = 7;
          return _workspaceService.workspaceService.updateMemberRole(actorUserId, workspaceId, targetUserId, role);
        case 7:
          result = _context9.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context9.next = 14;
          break;
        case 11:
          _context9.prev = 11;
          _context9.t0 = _context9["catch"](0);
          next(_context9.t0);
        case 14:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 11]]);
  }));
  return function updateMemberRole(_x23, _x24, _x25) {
    return _ref9.apply(this, arguments);
  };
}();
var leaveWorkspace = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(req, res, next) {
    var userId, workspaceId, result;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          userId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          _context0.next = 5;
          return _workspaceService.workspaceService.leaveWorkspace(userId, workspaceId);
        case 5:
          result = _context0.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context0.next = 12;
          break;
        case 9:
          _context0.prev = 9;
          _context0.t0 = _context0["catch"](0);
          next(_context0.t0);
        case 12:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 9]]);
  }));
  return function leaveWorkspace(_x26, _x27, _x28) {
    return _ref0.apply(this, arguments);
  };
}();
var getMembers = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(req, res, next) {
    var workspaceId, members;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          workspaceId = req.params.id;
          _context1.next = 4;
          return _workspaceService.workspaceService.getMembers(workspaceId);
        case 4:
          members = _context1.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(members);
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
  return function getMembers(_x29, _x30, _x31) {
    return _ref1.apply(this, arguments);
  };
}();
var transferOwnership = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res, next) {
    var actorUserId, workspaceId, targetUserId, result;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          actorUserId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          targetUserId = req.body.targetUserId;
          _context10.next = 6;
          return _workspaceService.workspaceService.transferOwnership(actorUserId, workspaceId, targetUserId);
        case 6:
          result = _context10.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context10.next = 13;
          break;
        case 10:
          _context10.prev = 10;
          _context10.t0 = _context10["catch"](0);
          next(_context10.t0);
        case 13:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 10]]);
  }));
  return function transferOwnership(_x32, _x33, _x34) {
    return _ref10.apply(this, arguments);
  };
}();
var updateLogo = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res, next) {
    var workspaceId, logoFile, result;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          workspaceId = req.params.id;
          logoFile = req.file;
          _context11.next = 5;
          return _workspaceService.workspaceService.updateLogo(workspaceId, logoFile);
        case 5:
          result = _context11.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context11.next = 12;
          break;
        case 9:
          _context11.prev = 9;
          _context11.t0 = _context11["catch"](0);
          next(_context11.t0);
        case 12:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 9]]);
  }));
  return function updateLogo(_x35, _x36, _x37) {
    return _ref11.apply(this, arguments);
  };
}();
var updateNotificationPrefs = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee12(req, res, next) {
    var userId, workspaceId, result;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          userId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          _context12.next = 5;
          return _workspaceService.workspaceService.updateNotificationPrefs(userId, workspaceId, req.body);
        case 5:
          result = _context12.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context12.next = 12;
          break;
        case 9:
          _context12.prev = 9;
          _context12.t0 = _context12["catch"](0);
          next(_context12.t0);
        case 12:
        case "end":
          return _context12.stop();
      }
    }, _callee12, null, [[0, 9]]);
  }));
  return function updateNotificationPrefs(_x38, _x39, _x40) {
    return _ref12.apply(this, arguments);
  };
}();
var workspaceController = {
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
exports.workspaceController = workspaceController;