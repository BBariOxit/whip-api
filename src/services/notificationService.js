import { notificationModel } from '~/models/notificationModel'
import { workspaceModel } from '~/models/workspaceModel'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import { brevoProvider } from '~/providers/brevoProvider'
import { NOTIFICATION_CONFIG, NOTIFICATION_TYPES, SOCKET_EVENTS } from '~/utils/constants'

// Render nội dung thông báo theo loại (dùng cho cả in-app lẫn email)
const buildMessage = (type, actorName, context = {}) => {
  const who = actorName || 'Someone'
  switch (type) {
    case NOTIFICATION_TYPES.MEMBER_JOINED:
      return `${who} joined the workspace${context.workspaceTitle ? ` "${context.workspaceTitle}"` : ''}`
    case NOTIFICATION_TYPES.BOARD_CREATED:
      return `${who} created the board "${context.boardTitle || 'a board'}"`
    case NOTIFICATION_TYPES.BOARD_DELETED:
      return `${who} deleted the board "${context.boardTitle || 'a board'}"`
    case NOTIFICATION_TYPES.BOARD_ACTIVITY:
      return `${who} ${context.detail || 'made a change'} in "${context.boardTitle || 'a board'}"`
    case NOTIFICATION_TYPES.MENTION:
      return `${who} mentioned you in "${context.boardTitle || 'a card'}"`
    default:
      return `${who} sent you a notification`
  }
}

const buildEmailHtml = (message) => `
  <div style="font-family:Arial,sans-serif;font-size:15px;color:#1f2328;">
    <p>${message}</p>
    <p style="color:#57606a;font-size:13px;">You are receiving this because of your notification settings on Whip.</p>
  </div>
`

/**
 * Hàm ĐẤU DÂY TRUNG TÂM: mọi sự kiện muốn báo cho user đều gọi qua đây.
 * Đọc tuỳ chọn của từng người nhận trong workspace rồi gửi đúng kênh (email / in-app).
 * Best-effort: KHÔNG bao giờ throw để tránh làm hỏng hành động chính (tạo board, comment...).
 *
 * @param {Object} p
 * @param {Object} p.io          socket.io instance (bắt buộc cho in-app; email không cần)
 * @param {string} p.type        NOTIFICATION_TYPES
 * @param {string} p.workspaceId workspace chứa prefs của người nhận
 * @param {string[]} p.recipientIds  userId người nhận
 * @param {string} p.actorId     người gây ra sự kiện (sẽ bị loại khỏi recipients)
 * @param {string} [p.actorName] tên hiển thị của actor (nếu chưa có sẽ tự tra)
 * @param {Object} [p.context]   { workspaceTitle, boardTitle, boardId, detail }
 */
const dispatch = async ({ io, type, workspaceId, recipientIds, actorId, actorName, context = {} }) => {
  try {
    const config = NOTIFICATION_CONFIG[type]
    if (!config || !workspaceId || !Array.isArray(recipientIds) || recipientIds.length === 0) return

    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) return

    // Map userId -> member (để lấy prefs + email)
    const memberMap = new Map()
    for (const m of (workspace.members || [])) {
      if (m.userId) memberMap.set(m.userId.toString(), m)
    }

    // Tự tra tên actor nếu chưa được truyền vào
    let resolvedActorName = actorName
    if (!resolvedActorName && actorId) {
      const actor = await userModel.findOneById(actorId)
      resolvedActorName = actor?.displayName || actor?.username || actor?.email
    }

    const message = buildMessage(type, resolvedActorName, context)

    // Loại trùng + loại chính actor khỏi danh sách nhận
    const uniqueRecipients = [...new Set(recipientIds.map(id => id?.toString()).filter(Boolean))]
      .filter(id => id !== actorId?.toString())

    for (const userId of uniqueRecipients) {
      const member = memberMap.get(userId)
      // Chỉ gửi cho member active của workspace (prefs sống ở đây)
      if (!member || member.status !== 'active') continue

      const prefs = { ...workspaceModel.DEFAULT_NOTIFICATION_PREFS, ...(member.notificationPrefs || {}) }
      if (!prefs[config.toggleKey]) continue

      if (config.channel === 'inApp') {
        const doc = await notificationModel.createNew({
          userId,
          type,
          message,
          actorId: actorId || null,
          workspaceId,
          boardId: context.boardId || null
        })
        if (io) io.to(`user:${userId}`).emit(SOCKET_EVENTS.NEW_NOTIFICATION, doc)
      } else if (config.channel === 'email') {
        try {
          await brevoProvider.sendEmail(member.email, 'Whip notification', buildEmailHtml(message))
        } catch (emailErr) {
          console.error('Notification email failed:', emailErr?.message)
        }
      }
    }
  } catch (error) {
    // Best-effort: chỉ log, không throw
    console.error('notificationService.dispatch error:', error?.message)
  }
}

/**
 * Tiện ích: báo "hoạt động trên board" (in-app) cho các thành viên của board.
 * Board cá nhân (không thuộc workspace) sẽ bỏ qua vì prefs sống ở workspace.
 */
const notifyBoardActivity = async ({ io, boardId, actorId, actorName, detail }) => {
  try {
    const board = await boardModel.findOneById(boardId)
    if (!board || !board.workspaceId) return

    const recipientIds = [
      ...(board.ownerIds || []),
      ...(board.memberIds || [])
    ].map(id => id.toString())

    await dispatch({
      io,
      type: NOTIFICATION_TYPES.BOARD_ACTIVITY,
      workspaceId: board.workspaceId.toString(),
      recipientIds,
      actorId,
      actorName,
      context: { boardTitle: board.title, boardId: board._id.toString(), detail }
    })
  } catch (error) {
    console.error('notifyBoardActivity error:', error?.message)
  }
}

const getForUser = async (userId) => {
  const notifications = await notificationModel.findByUser(userId)
  const unreadCount = await notificationModel.countUnread(userId)
  return { notifications, unreadCount }
}

const markAsRead = async (notificationId, userId) => {
  return await notificationModel.markRead(notificationId, userId)
}

const markAllAsRead = async (userId) => {
  await notificationModel.markAllRead(userId)
  return { success: true }
}

export const notificationService = {
  dispatch,
  notifyBoardActivity,
  getForUser,
  markAsRead,
  markAllAsRead
}
