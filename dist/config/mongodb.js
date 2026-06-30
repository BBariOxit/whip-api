"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET_DB = exports.CONNECT_DB = exports.CLOSE_DB = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _mongodb = require("mongodb");
var _environment = require("./environment");
/* eslint-disable no-console */
//EX

// Khởi tạo một đối tượng whipDatabaseInstance ban đầu là null (vì chúng ta chưa connect)
var whipDatabaseInstance = null;
// khởi tạo một đối tượng client để connect tới mongoDB
var client = new _mongodb.MongoClient(_environment.env.MONGODB_URI, {
  // Mấy cái option này để giúp kết nối ổn định hơn với Atlas, đỡ bị timeout
  serverApi: {
    version: _mongodb.ServerApiVersion.v1,
    // chỉ định 1 cái stable api version của mongoDB
    strict: true,
    deprecationErrors: true,
    family: 4
  },
  // Cái này để bảo Node.js là: "Kệ mẹ chứng chỉ lỗi, cứ kết nối đi bố mày cho phép"
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true
});
// kết nối tới db
var CONNECT_DB = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return client.connect();
        case 2:
          // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến whipDatabaseInstance ở trên của chúng ta
          whipDatabaseInstance = client.db(_environment.env.DATABASE_NAME);
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function CONNECT_DB() {
    return _ref.apply(this, arguments);
  };
}();

//đóng kết nối tới database khi cần
exports.CONNECT_DB = CONNECT_DB;
var CLOSE_DB = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          console.log('code chạy vào close');
          _context2.next = 3;
          return client.close();
        case 3:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function CLOSE_DB() {
    return _ref2.apply(this, arguments);
  };
}();

// Function GET DB (không async) này có nhiệm vụ export ra cái Whip Database Instance
// sau khi đã connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code.
// Lưu ý phải đảm bảo chỉ luôn gọi cái getDB này sau khi đã kết nối thành công tới MongoDB
exports.CLOSE_DB = CLOSE_DB;
var GET_DB = function GET_DB() {
  if (!whipDatabaseInstance) throw new Error('must connect to db first');
  return whipDatabaseInstance;
};
exports.GET_DB = GET_DB;