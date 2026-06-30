"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workspaceRoute = void 0;
var _express = _interopRequireDefault(require("express"));
var _workspaceController = require("../../controllers/workspaceController");
var _authMiddleware = require("../../middlewares/authMiddleware");
var _rbacMiddleware = require("../../middlewares/rbacMiddleware");
var _workspaceValidation = require("../../validations/workspaceValidation");
var _constants = require("../../utils/constants");
var Router = _express["default"].Router();
var OWNER = _constants.WORKSPACE_ROLES.OWNER,
  ADMIN = _constants.WORKSPACE_ROLES.ADMIN,
  MEMBER = _constants.WORKSPACE_ROLES.MEMBER;

// =============================================
// Routes KHÔNG CẦN workspace role check
// =============================================

// Lấy danh sách workspaces của user đang đăng nhập
Router.route('/').get(_authMiddleware.authMiddleware.isAuthorized, _workspaceController.workspaceController.getWorkspacesByUserId).post(_authMiddleware.authMiddleware.isAuthorized, _workspaceValidation.workspaceValidation.createNew, _workspaceController.workspaceController.createNew);

// =============================================
// Routes CẦN workspace role check (RBAC)
// =============================================

// Workspace CRUD — gắn RBAC middleware
Router.route('/:id')
// Mọi member đều xem được workspace details
.get(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireWorkspaceRole)([OWNER, ADMIN, MEMBER]), _workspaceController.workspaceController.getDetails)
// Chỉ Owner + Admin sửa workspace (đổi tên, mô tả)
.put(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireWorkspaceRole)([OWNER, ADMIN]), _workspaceValidation.workspaceValidation.update, _workspaceController.workspaceController.update)
// Chỉ Owner xóa workspace
["delete"](_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireWorkspaceRole)([OWNER]), _workspaceController.workspaceController.deleteItem);

// Member management
Router.route('/:id/members')
// Mọi member đều xem được danh sách members
.get(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireWorkspaceRole)([OWNER, ADMIN, MEMBER]), _workspaceController.workspaceController.getMembers)
// Chỉ Owner + Admin mời member mới
.post(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireWorkspaceRole)([OWNER, ADMIN]), _workspaceValidation.workspaceValidation.inviteMember, _workspaceController.workspaceController.inviteMember);

// Cập nhật role hoặc kick member cụ thể
Router.route('/:id/members/:targetUserId')
// Chỉ Owner + Admin đổi role
.put(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireWorkspaceRole)([OWNER, ADMIN]), _workspaceValidation.workspaceValidation.updateMemberRole, _workspaceController.workspaceController.updateMemberRole)
// Chỉ Owner + Admin kick member
["delete"](_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireWorkspaceRole)([OWNER, ADMIN]), _workspaceController.workspaceController.removeMember);

// Tự rời workspace (mọi member đều dùng được)
Router.route('/:id/leave').post(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireWorkspaceRole)([OWNER, ADMIN, MEMBER]), _workspaceController.workspaceController.leaveWorkspace);
var workspaceRoute = Router;
exports.workspaceRoute = workspaceRoute;