"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inviteUserToBoardSocket = void 0;
// param socket sẽ được lấy từ thư viện socket.io
var inviteUserToBoardSocket = function inviteUserToBoardSocket(io, socket) {
  // lắng nghe sự kiện mà client emit lên
  socket.on('FE_USER_INVITED_TO_BOARD', function (invitation) {
    // Cách làm nhanh & đơn giản nhất: Emit ngược lại một sự kiện về cho mọi client khác
    // (ngoại trừ chính cái thằng gửi request lên), rồi để phía FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation);
  });
};
exports.inviteUserToBoardSocket = inviteUserToBoardSocket;