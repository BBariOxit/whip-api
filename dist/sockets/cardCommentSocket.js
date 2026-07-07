"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cardCommentSocket = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _cardModel = require("../models/cardModel");
var _boardModel = require("../models/boardModel");
var _rbacMiddleware = require("../middlewares/rbacMiddleware");
// Socket handler xử lý Join/Leave Room cho Card Detail Modal
// Khi user mở Modal Card → join vào room 'card:<cardId>'
// Khi user đóng Modal Card → rời khỏi room
var cardCommentSocket = function cardCommentSocket(io, socket) {
  // Lắng nghe khi FE yêu cầu vào phòng của Card
  socket.on('FE_JOIN_CARD', /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(cardId) {
      var card, board, role;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            if (!(!socket.userId || !cardId)) {
              _context.next = 3;
              break;
            }
            return _context.abrupt("return");
          case 3:
            _context.next = 5;
            return _cardModel.cardModel.findOneById(cardId);
          case 5:
            card = _context.sent;
            if (card) {
              _context.next = 8;
              break;
            }
            return _context.abrupt("return");
          case 8:
            _context.next = 10;
            return _boardModel.boardModel.findOneById(card.boardId);
          case 10:
            board = _context.sent;
            if (board) {
              _context.next = 13;
              break;
            }
            return _context.abrupt("return");
          case 13:
            _context.next = 15;
            return (0, _rbacMiddleware.getBoardAccessRole)(board, socket.userId);
          case 15:
            role = _context.sent;
            if (!(role === 'none')) {
              _context.next = 18;
              break;
            }
            return _context.abrupt("return");
          case 18:
            socket.join("card:".concat(cardId));
            _context.next = 23;
            break;
          case 21:
            _context.prev = 21;
            _context.t0 = _context["catch"](0);
          case 23:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 21]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  // Lắng nghe khi FE yêu cầu rời phòng của Card (leave luôn an toàn)
  socket.on('FE_LEAVE_CARD', function (cardId) {
    socket.leave("card:".concat(cardId));
  });
};
exports.cardCommentSocket = cardCommentSocket;