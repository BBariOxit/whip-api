import express from 'express'
import { workspaceController } from '~/controllers/workspaceController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireWorkspaceRole } from '~/middlewares/rbacMiddleware'
import { workspaceValidation } from '~/validations/workspaceValidation'
import { WORKSPACE_ROLES } from '~/utils/constants'

const Router = express.Router()

const { OWNER, ADMIN, MEMBER } = WORKSPACE_ROLES

// =============================================
// Routes KHÔNG CẦN workspace role check
// =============================================

// Lấy danh sách workspaces của user đang đăng nhập
Router.route('/')
  .get(authMiddleware.isAuthorized, workspaceController.getWorkspacesByUserId)
  .post(authMiddleware.isAuthorized, workspaceValidation.createNew, workspaceController.createNew)

// Accept invite (user clicks link in email)
Router.route('/accept-invite')
  .put(authMiddleware.isAuthorized, workspaceController.acceptInvite)

// =============================================
// Routes CẦN workspace role check (RBAC)
// =============================================

// Workspace CRUD — gắn RBAC middleware
Router.route('/:id')
  // Mọi member đều xem được workspace details
  .get(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER, ADMIN, MEMBER]), workspaceController.getDetails)
  // Chỉ Owner sửa workspace (đổi tên, mô tả)
  .put(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER]), workspaceValidation.update, workspaceController.update)
  // Chỉ Owner xóa workspace
  .delete(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER]), workspaceController.deleteItem)

// Member management
Router.route('/:id/members')
  // Mọi member đều xem được danh sách members
  .get(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER, ADMIN, MEMBER]), workspaceController.getMembers)
  // Chỉ Owner + Admin mời member mới
  .post(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER, ADMIN]), workspaceValidation.inviteMember, workspaceController.inviteMember)

// Cập nhật role hoặc kick member cụ thể
Router.route('/:id/members/:targetUserId')
  // Chỉ Owner + Admin đổi role
  .put(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER, ADMIN]), workspaceValidation.updateMemberRole, workspaceController.updateMemberRole)
  // Chỉ Owner + Admin kick member
  .delete(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER, ADMIN]), workspaceController.removeMember)

// Tự rời workspace (mọi member đều dùng được)
Router.route('/:id/leave')
  .post(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER, ADMIN, MEMBER]), workspaceController.leaveWorkspace)

export const workspaceRoute = Router
