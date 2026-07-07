"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.socketAuthMiddleware = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _JwtProvider = require("../providers/JwtProvider");
var _environment = require("../config/environment");
// Parse chuỗi cookie thô từ handshake header thành object { key: value }
var parseCookie = function parseCookie(cookieHeader) {
  var out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach(function (pair) {
    var idx = pair.indexOf('=');
    if (idx > -1) {
      out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
    }
  });
  return out;
};

// Middleware xác thực kết nối socket qua accessToken trong cookie (giống HTTP authMiddleware).
// Cố ý "lenient": token hợp lệ -> gắn socket.userId; không có/không hợp lệ -> vẫn cho kết nối
// nhưng KHÔNG có userId, nên sẽ không join được các room nhạy cảm (vd room comment của card).
var socketAuthMiddleware = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(socket, next) {
    var _socket$handshake, cookies, token, decoded;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          cookies = parseCookie((_socket$handshake = socket.handshake) === null || _socket$handshake === void 0 || (_socket$handshake = _socket$handshake.headers) === null || _socket$handshake === void 0 ? void 0 : _socket$handshake.cookie);
          token = cookies.accessToken;
          if (!token) {
            _context.next = 8;
            break;
          }
          _context.next = 6;
          return _JwtProvider.jwtProvider.verifyToken(token, _environment.env.ACCESS_TOKEN_SECRET_SIGNATURE);
        case 6:
          decoded = _context.sent;
          socket.userId = decoded._id;
        case 8:
          _context.next = 12;
          break;
        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
        case 12:
          next();
        case 13:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 10]]);
  }));
  return function socketAuthMiddleware(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports.socketAuthMiddleware = socketAuthMiddleware;