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

import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { BOARD_TYPES, WORKSPACE_ROLES } from '~/utils/constants'

/**
 * Hàm Helper: Xác định Role của User đối với một Board cụ thể.
 * Trả về một trong các string: 'admin', 'member', 'viewer', 'none'
 */
export const getBoardAccessRole = async (board, userId) => {
  // 1. Kiểm tra trực tiếp trên Board (người tạo hoặc thành viên đích danh)
  const isOwner = board.ownerIds?.some(id => id.toString() === userId.toString())
  if (isOwner) return 'admin'

  const isMember = board.memberIds?.some(id => id.toString() === userId.toString())
  
  // 2. Nếu Board thuộc về một Workspace, kiểm tra quyền kế thừa
  if (board.workspaceId) {
    const workspace = await workspaceModel.findById(board.workspaceId.toString())
    if (workspace) {
      const memberInfo = workspace.members?.find(m => m.userId.toString() === userId.toString())
      if (memberInfo) {
        if (memberInfo.role === WORKSPACE_ROLES.OWNER || memberInfo.role === WORKSPACE_ROLES.ADMIN) {
          return 'admin' // Admin của Workspace -> Admin của Board
        }
        if (memberInfo.role === WORKSPACE_ROLES.MEMBER) {
          // Member của Workspace: Chỉ được coi là Member của Board nếu Board là workspace_visible HOẶC được mời đích danh
          if (board.type === BOARD_TYPES.WORKSPACE_VISIBLE || isMember) {
            return 'member'
          }
        }
      }
    }
  }

  // Nếu không được kế thừa từ Workspace mà có trong memberIds thì vẫn là member
  if (isMember) return 'member'

  // 3. Nếu là Board Public thì bất kỳ ai cũng có quyền xem (viewer)
  if (board.type === BOARD_TYPES.PUBLIC) {
    return 'viewer'
  }

  // Không có quyền gì cả
  return 'none'
}

/**
 * Dynamic RBAC Middleware cho Board, Column, Card
 * Tự động moi boardId dựa theo URL và tính toán Role
 */
export const requireBoardRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Đối với public board, viewer có thể không cần login, NHƯNG các thao tác sửa thì cần login.
      // Do đó nếu allowedRoles chỉ yêu cầu 'viewer' và không có userId, ta có thể du di hoặc bắt buộc.
      // Tốt nhất là requireAuth ở route, nếu route cho phép optional auth (như GET /boards/:id) thì userId có thể undefined.
      const userId = req.jwtDecoded?._id
      
      let boardId = req.body.boardId || req.query.boardId
      let board = null

      // Tự động tìm boardId nếu route là columns/:id hoặc cards/:id
      if (!boardId && req.params.id) {
        if (req.baseUrl.includes('/boards')) {
          boardId = req.params.id
        } else if (req.baseUrl.includes('/columns')) {
          const column = await columnModel.findOneById(req.params.id)
          if (!column) throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
          boardId = column.boardId.toString()
        } else if (req.baseUrl.includes('/cards')) {
          const card = await cardModel.findOneById(req.params.id)
          if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
          boardId = card.boardId.toString()
        }
      }

      if (!boardId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Board ID could not be determined for access check.')
      }

      board = await boardModel.findOneById(boardId)
      if (!board) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
      }

      // Tính toán role
      let userRole = 'none'
      if (userId) {
        userRole = await getBoardAccessRole(board, userId)
      } else if (board.type === BOARD_TYPES.PUBLIC) {
        // Nếu không login mà board public thì vẫn được quyền viewer
        userRole = 'viewer'
      }

      // Kiểm tra xem role hiện tại có nằm trong danh sách cho phép không
      if (!allowedRoles.includes(userRole)) {
        throw new ApiError(
          StatusCodes.FORBIDDEN, 
          `Access denied. You need one of these roles: [${allowedRoles.join(', ')}] but you are '${userRole}'.`
        )
      }

      // Đính kèm board vào req để controller xài nếu cần (đỡ phải query lại)
      req.board = board
      req.boardAccessRole = userRole

      next()
    } catch (error) {
      next(new ApiError(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR, error.message))
    }
  }
}

/**
 * Hàm bọc lại requireBoardAdmin cũ để không vỡ logic ở những chỗ đang xài
 */
export const requireBoardAdmin = requireBoardRole(['admin'])
