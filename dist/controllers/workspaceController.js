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
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var userId, createdWorkspace;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          userId = req.jwtDecoded._id;
          _context.next = 4;
          return _workspaceService.workspaceService.createNew(userId, req.body);
        case 4:
          createdWorkspace = _context.sent;
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(createdWorkspace);
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
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(result);
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
var removeMember = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var actorUserId, workspaceId, targetUserId, result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          actorUserId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          targetUserId = req.params.targetUserId;
          _context7.next = 6;
          return _workspaceService.workspaceService.removeMember(actorUserId, workspaceId, targetUserId);
        case 6:
          result = _context7.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
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
  return function removeMember(_x17, _x18, _x19) {
    return _ref7.apply(this, arguments);
  };
}();
var updateMemberRole = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var actorUserId, workspaceId, targetUserId, role, result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          actorUserId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          targetUserId = req.params.targetUserId;
          role = req.body.role;
          _context8.next = 7;
          return _workspaceService.workspaceService.updateMemberRole(actorUserId, workspaceId, targetUserId, role);
        case 7:
          result = _context8.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context8.next = 14;
          break;
        case 11:
          _context8.prev = 11;
          _context8.t0 = _context8["catch"](0);
          next(_context8.t0);
        case 14:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 11]]);
  }));
  return function updateMemberRole(_x20, _x21, _x22) {
    return _ref8.apply(this, arguments);
  };
}();
var leaveWorkspace = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var userId, workspaceId, result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          userId = req.jwtDecoded._id;
          workspaceId = req.params.id;
          _context9.next = 5;
          return _workspaceService.workspaceService.leaveWorkspace(userId, workspaceId);
        case 5:
          result = _context9.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context9.next = 12;
          break;
        case 9:
          _context9.prev = 9;
          _context9.t0 = _context9["catch"](0);
          next(_context9.t0);
        case 12:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 9]]);
  }));
  return function leaveWorkspace(_x23, _x24, _x25) {
    return _ref9.apply(this, arguments);
  };
}();
var getMembers = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(req, res, next) {
    var workspaceId, members;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          workspaceId = req.params.id;
          _context0.next = 4;
          return _workspaceService.workspaceService.getMembers(workspaceId);
        case 4:
          members = _context0.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(members);
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
  return function getMembers(_x26, _x27, _x28) {
    return _ref0.apply(this, arguments);
  };
}();
var workspaceController = {
  createNew: createNew,
  getWorkspacesByUserId: getWorkspacesByUserId,
  getDetails: getDetails,
  deleteItem: deleteItem,
  update: update,
  inviteMember: inviteMember,
  removeMember: removeMember,
  updateMemberRole: updateMemberRole,
  leaveWorkspace: leaveWorkspace,
  getMembers: getMembers
};
exports.workspaceController = workspaceController;