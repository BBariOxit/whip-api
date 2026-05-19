
// param socket sẽ được lấy từ thư viện socket.io
export const inviteUserToBoardSocket = (io, socket) => {
  // lắng nghe sự kiện mà client emit lên
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // Cách làm nhanh & đơn giản nhất: Emit ngược lại một sự kiện về cho mọi client khác
    // (ngoại trừ chính cái thằng gửi request lên), rồi để phía FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
} 
