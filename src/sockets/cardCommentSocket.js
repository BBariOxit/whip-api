
// Socket handler xử lý Join/Leave Room cho Card Detail Modal
// Khi user mở Modal Card → join vào room 'card:<cardId>'
// Khi user đóng Modal Card → rời khỏi room
export const cardCommentSocket = (io, socket) => {
  // Lắng nghe khi FE yêu cầu vào phòng của Card
  socket.on('FE_JOIN_CARD', (cardId) => {
    socket.join(`card:${cardId}`)
  })

  // Lắng nghe khi FE yêu cầu rời phòng của Card
  socket.on('FE_LEAVE_CARD', (cardId) => {
    socket.leave(`card:${cardId}`)
  })
}
