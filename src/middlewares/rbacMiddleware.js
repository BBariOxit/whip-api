import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { workspaceModel } from '~/models/workspaceModel'

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
export const requireWorkspaceRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.jwtDecoded?._id
      if (!userId) {
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Please login.'))
      }

      // Lấy workspaceId từ route param (:id) hoặc body
      const workspaceId = req.params.id || req.body.workspaceId
      if (!workspaceId) {
        return next(new ApiError(StatusCodes.BAD_REQUEST, 'Workspace ID is required.'))
      }

      // Query workspace kiểm tra user có trong members với role phù hợp không
      const workspace = await workspaceModel.findByMemberWithRole(workspaceId, userId, allowedRoles)

      if (!workspace) {
        return next(new ApiError(
          StatusCodes.FORBIDDEN,
          'Access denied. You do not have permission to perform this action on this workspace.'
        ))
      }

      // Tìm role cụ thể của user trong workspace để controller dùng
      const memberInfo = workspace.members.find(
        m => m.userId.toString() === userId.toString()
      )

      // Gắn thông tin vào request object cho các tầng phía sau sử dụng
      req.workspace = workspace
      req.workspaceMemberRole = memberInfo?.role || null

      next()
    } catch (error) {
      next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
    }
  }
}
