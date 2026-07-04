import express from 'express'
import { workspaceController } from '~/controllers/workspaceController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { requireWorkspaceRole } from '~/middlewares/rbacMiddleware'
import { workspaceValidation } from '~/validations/workspaceValidation'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
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

// Chuyển quyền sở hữu (chỉ Owner)
Router.route('/:id/transfer-ownership')
  .post(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER]), workspaceValidation.transferOwnership, workspaceController.transferOwnership)

// Upload / cập nhật logo workspace (chỉ Owner)
Router.route('/:id/logo')
  .put(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER]), multerUploadMiddleware.upload.single('logo'), workspaceController.updateLogo)

// Cập nhật tuỳ chọn thông báo cá nhân (mọi member đều chỉnh prefs của chính mình)
Router.route('/:id/notifications')
  .put(authMiddleware.isAuthorized, requireWorkspaceRole([OWNER, ADMIN, MEMBER]), workspaceValidation.updateNotificationPrefs, workspaceController.updateNotificationPrefs)

export const workspaceRoute = Router
