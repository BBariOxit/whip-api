import { notificationModel } from '~/models/notificationModel'
import { workspaceModel } from '~/models/workspaceModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { userModel } from '~/models/userModel'
import { brevoProvider } from '~/providers/brevoProvider'
import { NOTIFICATION_CONFIG, NOTIFICATION_TYPES, SOCKET_EVENTS, WORKSPACE_ROLES } from '~/utils/constants'

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

    // Gom notification in-app để ghi 1 lần bằng insertMany (tránh await từng doc khi fan-out)
    const inAppDocs = []
    for (const userId of uniqueRecipients) {
      const member = memberMap.get(userId)
      // Chỉ gửi cho member active của workspace (prefs sống ở đây)
      if (!member || member.status !== 'active') continue

      const prefs = { ...workspaceModel.DEFAULT_NOTIFICATION_PREFS, ...(member.notificationPrefs || {}) }
      if (!prefs[config.toggleKey]) continue

      if (config.channel === 'inApp') {
        inAppDocs.push({
          userId,
          type,
          message,
          actorId: actorId || null,
          workspaceId,
          boardId: context.boardId || null
        })
      } else if (config.channel === 'email') {
        try {
          await brevoProvider.sendEmail(member.email, 'Whip notification', buildEmailHtml(message))
        } catch (emailErr) {
          console.error('Notification email failed:', emailErr?.message)
        }
      }
    }

    // Ghi tất cả in-app trong 1 lệnh rồi đẩy realtime tới từng room user
    if (inAppDocs.length > 0) {
      const created = await notificationModel.createMany(inAppDocs)
      if (io) {
        for (const doc of created) {
          io.to(`user:${doc.userId.toString()}`).emit(SOCKET_EVENTS.NEW_NOTIFICATION, doc)
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

/**
 * Báo cho các thành viên workspace khi 1 board được TẠO hoặc XOÁ (in-app).
 * Chỉ áp dụng cho board thuộc workspace — board cá nhân (không có workspaceId) bỏ qua.
 * boardId (nếu có) để click điều hướng — chỉ truyền khi board còn tồn tại (BOARD_CREATED).
 * Best-effort: không throw để tránh chặn hành động tạo/xoá board.
 */
const notifyWorkspaceBoardChange = async ({ io, type, workspaceId, boardTitle, boardId, actorId, actorName }) => {
  try {
    if (!workspaceId) return
    const workspace = await workspaceModel.findById(workspaceId)
    if (!workspace) return

    const recipientIds = (workspace.members || [])
      .filter(m => m.userId && m.status === 'active')
      .map(m => m.userId.toString())

    await dispatch({
      io,
      type,
      workspaceId: workspaceId.toString(),
      recipientIds,
      actorId,
      actorName,
      context: { boardTitle, boardId: boardId || null }
    })
  } catch (error) {
    console.error('notifyWorkspaceBoardChange error:', error?.message)
  }
}

// Rút các "@token" (không chứa dấu cách) trong nội dung comment để so khớp với handle member
const MENTION_TOKEN_REGEX = /@([\p{L}\p{N}._-]+)/gu
// Token đặc biệt: "@all" báo cho toàn bộ thành viên board
const MENTION_ALL_TOKEN = 'all'
const extractMentionTokens = (content) => {
  const tokens = new Set()
  if (!content) return tokens
  for (const match of content.matchAll(MENTION_TOKEN_REGEX)) {
    tokens.add(match[1].toLowerCase())
  }
  return tokens
}

/**
 * Bắn thông báo MENTION (in-app) khi có người @nhắc tên trong comment.
 * - "@all": báo cho TẤT CẢ thành viên (owner + member) của board.
 * - "@<handle>": so khớp username / displayName(1 từ) / phần trước @ của email.
 *   Ứng viên = thành viên board + owner/admin của workspace (owner/admin được tag
 *   ở BẤT KỲ board nào trong workspace, kể cả chưa join board đó).
 * Chỉ áp dụng cho card thuộc board có workspace (prefs sống ở workspace).
 * dispatch còn lọc thêm: chỉ gửi cho member active của workspace đang BẬT toggle mentions.
 * Best-effort: không throw.
 */
const notifyMentions = async ({ io, cardId, actorId, actorName, content }) => {
  try {
    const tokens = extractMentionTokens(content)
    if (tokens.size === 0) return

    const card = await cardModel.findOneById(cardId)
    if (!card?.boardId) return
    const board = await boardModel.findOneById(card.boardId)
    if (!board?.workspaceId) return
    const workspace = await workspaceModel.findById(board.workspaceId)
    if (!workspace) return

    const actorStr = actorId?.toString()

    // Thành viên của board (owner + member)
    const boardMemberIds = [...new Set(
      [...(board.ownerIds || []), ...(board.memberIds || [])].map(id => id.toString())
    )]

    // Owner/Admin của workspace — được phép tag xuyên board
    const workspaceAdminIds = (workspace.members || [])
      .filter(m => m.userId && m.status === 'active' &&
        (m.role === WORKSPACE_ROLES.OWNER || m.role === WORKSPACE_ROLES.ADMIN))
      .map(m => m.userId.toString())

    const recipientSet = new Set()

    // "@all" → toàn bộ thành viên board
    if (tokens.has(MENTION_ALL_TOKEN)) {
      boardMemberIds.forEach(id => recipientSet.add(id))
    }

    // Mention theo handle: ứng viên gồm thành viên board + owner/admin workspace
    const candidateIds = [...new Set([...boardMemberIds, ...workspaceAdminIds])]
    if (candidateIds.length > 0) {
      const users = await userModel.findManyByIds(candidateIds)
      for (const u of users) {
        const handles = [u.username, u.displayName, u.email?.split('@')[0]]
          .filter(Boolean)
          .map(h => h.toLowerCase())
        if (handles.some(h => tokens.has(h))) recipientSet.add(u._id.toString())
      }
    }

    // Không tự báo cho chính người viết
    recipientSet.delete(actorStr)

    const recipientIds = [...recipientSet]
    if (recipientIds.length === 0) return

    await dispatch({
      io,
      type: NOTIFICATION_TYPES.MENTION,
      workspaceId: board.workspaceId.toString(),
      recipientIds,
      actorId,
      actorName,
      context: { boardTitle: card.title, boardId: board._id.toString() }
    })
  } catch (error) {
    console.error('notifyMentions error:', error?.message)
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

const deleteNotification = async (notificationId, userId) => {
  return await notificationModel.softDelete(notificationId, userId)
}

export const notificationService = {
  dispatch,
  notifyBoardActivity,
  notifyWorkspaceBoardChange,
  notifyMentions,
  getForUser,
  markAsRead,
  markAllAsRead,
  deleteNotification
}
