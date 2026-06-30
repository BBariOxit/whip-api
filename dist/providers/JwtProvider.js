"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jwtProvider = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
/**
 * Function tạo mới một token - Cần 3 tham số đầu vào
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature: Chữ ký bí mật (dạng một chuỗi string ngẫu nhiên) trên docs thì để tên là privateKey tùy đều được
 * tokenLife: Thời gian sống của token
 */
var generateToken = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(userInfo, secretSignature, tokenLife) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          return _context.abrupt("return", _jsonwebtoken["default"].sign(userInfo, secretSignature, {
            algorithm: 'HS256',
            expiresIn: tokenLife
          }));
        case 4:
          _context.prev = 4;
          _context.t0 = _context["catch"](0);
          throw new Error(_context.t0);
        case 7:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 4]]);
  }));
  return function generateToken(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Function kiểm tra một token có hợp lệ hay không
 * Hợp lệ ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ ký bí mật secretSignature trong dự án hay không
 */
var verifyToken = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(token, secretSignature) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          return _context2.abrupt("return", _jsonwebtoken["default"].verify(token, secretSignature));
        case 4:
          _context2.prev = 4;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 7:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 4]]);
  }));
  return function verifyToken(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();
var jwtProvider = {
  generateToken: generateToken,
  verifyToken: verifyToken
};
exports.jwtProvider = jwtProvider;