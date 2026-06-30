"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requireWorkspaceRole = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _workspaceModel = require("../models/workspaceModel");
/**
 * Dynamic RBAC Middleware cho Workspace
 * Nhận vào mảng các Role được phép truy cập
 * 
 * Cách dùng trong route:
 *   requireWorkspaceRole(['owner', 'admin']) — chỉ Owner và Admin mới qua
 *   requireWorkspaceRole(['owner', 'admin', 'member']) — tất cả member
 * 
 * Sau khi pass:
 *   req.workspace = workspace document
 *   req.workspaceMemberRole = role string ('owner' | 'admin' | 'member')
 */
var requireWorkspaceRole = function requireWorkspaceRole() {
  var allowedRoles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
      var _req$jwtDecoded, userId, workspaceId, workspace, memberInfo;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            userId = (_req$jwtDecoded = req.jwtDecoded) === null || _req$jwtDecoded === void 0 ? void 0 : _req$jwtDecoded._id;
            if (userId) {
              _context.next = 4;
              break;
            }
            return _context.abrupt("return", next(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNAUTHORIZED, 'Unauthorized! Please login.')));
          case 4:
            // Lấy workspaceId từ route param (:id) hoặc body
            workspaceId = req.params.id || req.body.workspaceId;
            if (workspaceId) {
              _context.next = 7;
              break;
            }
            return _context.abrupt("return", next(new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Workspace ID is required.')));
          case 7:
            _context.next = 9;
            return _workspaceModel.workspaceModel.findByMemberWithRole(workspaceId, userId, allowedRoles);
          case 9:
            workspace = _context.sent;
            if (workspace) {
              _context.next = 12;
              break;
            }
            return _context.abrupt("return", next(new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Access denied. You do not have permission to perform this action on this workspace.')));
          case 12:
            // Tìm role cụ thể của user trong workspace để controller dùng
            memberInfo = workspace.members.find(function (m) {
              return m.userId.toString() === userId.toString();
            }); // Gắn thông tin vào request object cho các tầng phía sau sử dụng
            req.workspace = workspace;
            req.workspaceMemberRole = (memberInfo === null || memberInfo === void 0 ? void 0 : memberInfo.role) || null;
            next();
            _context.next = 21;
            break;
          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](0);
            next(new _ApiError["default"](_httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR, _context.t0.message));
          case 21:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 18]]);
    }));
    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
};
exports.requireWorkspaceRole = requireWorkspaceRole;