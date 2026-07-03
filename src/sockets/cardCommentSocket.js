import { cardModel } from '~/models/cardModel'
import { boardModel } from '~/models/boardModel'
import { getBoardAccessRole } from '~/middlewares/rbacMiddleware'

// Socket handler xử lý Join/Leave Room cho Card Detail Modal
// Khi user mở Modal Card → join vào room 'card:<cardId>'
// Khi user đóng Modal Card → rời khỏi room
export const cardCommentSocket = (io, socket) => {
  // Lắng nghe khi FE yêu cầu vào phòng của Card
  socket.on('FE_JOIN_CARD', async (cardId) => {
    try {
      // 👑 Chỉ cho vào room nếu đã xác thực VÀ có quyền xem board chứa card.
      // Nếu không, kẻ tấn công có thể join room card bất kỳ để nghe trộm comment realtime của board private.
      if (!socket.userId || !cardId) return

      const card = await cardModel.findOneById(cardId)
      if (!card) return

      const board = await boardModel.findOneById(card.boardId)
      if (!board) return

      const role = await getBoardAccessRole(board, socket.userId)
      if (role === 'none') return

      socket.join(`card:${cardId}`)
    } catch (error) {
      // Có lỗi thì đơn giản là không cho join
    }
  })

  // Lắng nghe khi FE yêu cầu rời phòng của Card (leave luôn an toàn)
  socket.on('FE_LEAVE_CARD', (cardId) => {
    socket.leave(`card:${cardId}`)
  })
}
