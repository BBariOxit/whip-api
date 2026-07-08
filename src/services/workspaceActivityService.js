import { workspaceActivityModel } from '~/models/workspaceActivityModel'
import { userModel } from '~/models/userModel'

/**
 * Ghi lại 1 hoạt động cấp workspace ("macro event": tạo/xoá board, mời/kick member, đổi settings...).
 *
 * BEST-EFFORT: KHÔNG BAO GIỜ throw — activity log chỉ là lớp ghi nhận phụ, không được phép làm
 * hỏng hành động chính (tạo board, kick member...). Mọi lỗi chỉ log ra console.
 *
 * Snapshot actorName/actorAvatar ngay lúc ghi (không $lookup lúc đọc) để log vẫn hiển thị đúng
 * kể cả khi actor sau này rời workspace hoặc đổi tên — đúng bản chất của một audit log.
 *
 * @param {Object} p
 * @param {string} p.workspaceId  workspace chứa hoạt động
 * @param {string} p.actorId      người gây ra hành động
 * @param {string} p.actionType   WORKSPACE_ACTIVITY_TYPES
 * @param {string} [p.actorName]  tên hiển thị của actor (nếu chưa truyền sẽ tự tra)
 * @param {string} [p.actorAvatar] avatar actor (nếu chưa truyền sẽ tự tra)
 * @param {string} [p.targetName] đối tượng bị tác động (board title, email, tên member...)
 * @param {Object} [p.metadata]   dữ liệu bổ sung cho FE render
 */
const log = async ({ workspaceId, actorId, actionType, actorName, actorAvatar, targetName = null, metadata = null }) => {
  try {
    if (!workspaceId || !actorId || !actionType) return

    // Tự tra snapshot tên/avatar nếu caller chưa cung cấp
    let name = actorName
    let avatar = actorAvatar
    if (!name) {
      const actor = await userModel.findOneById(actorId)
      name = actor?.displayName || actor?.username || actor?.email || 'Someone'
      if (avatar === undefined || avatar === null) avatar = actor?.avatar || null
    }

    await workspaceActivityModel.createNew({
      workspaceId: workspaceId.toString(),
      actorId: actorId.toString(),
      actorName: name,
      actorAvatar: avatar || null,
      actionType,
      targetName: targetName || null,
      metadata
    })
  } catch (error) {
    // Best-effort: chỉ log, không throw
    console.error('workspaceActivityService.log error:', error?.message)
  }
}

const getActivities = async (workspaceId, page, limit) => {
  try {
    return await workspaceActivityModel.getByWorkspaceId(workspaceId, page, limit)
  } catch (error) {
    throw error
  }
}

export const workspaceActivityService = {
  log,
  getActivities
}
