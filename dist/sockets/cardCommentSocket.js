"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cardCommentSocket = void 0;
// Socket handler xử lý Join/Leave Room cho Card Detail Modal
// Khi user mở Modal Card → join vào room 'card:<cardId>'
// Khi user đóng Modal Card → rời khỏi room
var cardCommentSocket = function cardCommentSocket(io, socket) {
  // Lắng nghe khi FE yêu cầu vào phòng của Card
  socket.on('FE_JOIN_CARD', function (cardId) {
    socket.join("card:".concat(cardId));
  });

  // Lắng nghe khi FE yêu cầu rời phòng của Card
  socket.on('FE_LEAVE_CARD', function (cardId) {
    socket.leave("card:".concat(cardId));
  });
};
exports.cardCommentSocket = cardCommentSocket;