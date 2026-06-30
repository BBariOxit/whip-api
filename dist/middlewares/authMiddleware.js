"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authMiddleware = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _JwtProvider = require("../providers/JwtProvider");
var _environment = require("../config/environment");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
// Middleware này sẽ đảm nhận việc quan trọng: 
// Xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không
var isAuthorized = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var _req$cookies;
    var clientAccessToken, accessTokenDecoded, _error$message;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          // Lấy accessToken nằm trong request cookies phía client - withCredentials trong file authorizeAxios
          clientAccessToken = (_req$cookies = req.cookies) === null || _req$cookies === void 0 ? void 0 : _req$cookies.accessToken; // nếu như cái access Token không tồn tại thì trả về lỗi luôn
          if (clientAccessToken) {
            _context.next = 4;
            break;
          }
          next(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'));
          return _context.abrupt("return");
        case 4:
          _context.prev = 4;
          _context.next = 7;
          return _JwtProvider.jwtProvider.verifyToken(clientAccessToken, _environment.env.ACCESS_TOKEN_SECRET_SIGNATURE);
        case 7:
          accessTokenDecoded = _context.sent;
          // console.log('accessTokenDecoded', accessTokenDecoded)
          // Bước 02: Quan trọng: Nếu như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được vào cái req.jwtDecoded, để sử dụng cho các tầng cần xử lý ở phía sau
          req.jwtDecoded = accessTokenDecoded;

          // Bước 03: Cho phép cái request đi tiếp
          next();
          _context.next = 18;
          break;
        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](4);
          if (!(_context.t0 !== null && _context.t0 !== void 0 && (_error$message = _context.t0.message) !== null && _error$message !== void 0 && _error$message.includes('jwt expired'))) {
            _context.next = 17;
            break;
          }
          next(new _ApiError["default"](_httpStatusCodes.StatusCodes.GONE, 'Need to refresh token.'));
          return _context.abrupt("return");
        case 17:
          // Nếu như cái accessToken nó không hợp lệ do bất kỳ điều gì khác vụ hết hạn thì chúng ta cứ
          // thẳng tay trả về mã 401 cho phía FE gọi api sign_out luôn
          next(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNAUTHORIZED, 'Unauthorized!'));
        case 18:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[4, 12]]);
  }));
  return function isAuthorized(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

// Middleware để xác thực token nhưng không bắt buộc (dành cho API có thể truy cập public)
var optionalAuth = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var _req$cookies2;
    var clientAccessToken, accessTokenDecoded;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          clientAccessToken = (_req$cookies2 = req.cookies) === null || _req$cookies2 === void 0 ? void 0 : _req$cookies2.accessToken;
          if (clientAccessToken) {
            _context2.next = 4;
            break;
          }
          // Không có token, xem như Guest
          req.jwtDecoded = null;
          return _context2.abrupt("return", next());
        case 4:
          _context2.prev = 4;
          _context2.next = 7;
          return _JwtProvider.jwtProvider.verifyToken(clientAccessToken, _environment.env.ACCESS_TOKEN_SECRET_SIGNATURE);
        case 7:
          accessTokenDecoded = _context2.sent;
          req.jwtDecoded = accessTokenDecoded;
          next();
          _context2.next = 16;
          break;
        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](4);
          // Nếu có token nhưng lỗi (hết hạn, sai chữ ký, v.v.), vẫn cho qua nhưng với vai trò Guest
          // Hoặc có thể trả về lỗi tuỳ thuộc vào requirement, nhưng ở đây ta xem như Guest
          req.jwtDecoded = null;
          next();
        case 16:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[4, 12]]);
  }));
  return function optionalAuth(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var authMiddleware = {
  isAuthorized: isAuthorized,
  optionalAuth: optionalAuth
};
exports.authMiddleware = authMiddleware;