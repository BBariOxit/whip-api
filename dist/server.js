"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _asyncExitHook = _interopRequireDefault(require("async-exit-hook"));
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _cors2 = require("./config/cors");
var _mongodb = require("./config/mongodb");
var _environment = require("./config/environment");
var _v = require("./routes/v1");
var _errorHandlingMiddleware = require("./middlewares/errorHandlingMiddleware");
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _socket = _interopRequireDefault(require("socket.io"));
var _http = _interopRequireDefault(require("http"));
var _cardCommentSocket = require("./sockets/cardCommentSocket");
var _socketAuth = require("./sockets/socketAuth");
var _notificationModel = require("./models/notificationModel");
/* eslint-disable no-console */

// Xử lý socket real-time với gói socket.io
// https://socket.io/get-started/chat/#integrating-socketio

var START_SERVER = function START_SERVER() {
  var app = (0, _express["default"])();

  // Fix cái vụ Cache from disk của ExpressJS
  app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // cấu hình cookiePaser
  app.use((0, _cookieParser["default"])());

  // xử lý cors
  app.use((0, _cors["default"])(_cors2.corsOptions));

  //enable req.body json data
  app.use(_express["default"].json());

  //use api v1
  app.use('/v1', _v.APIs_V1);

  // middlewares xử lý lỗi tập trung
  app.use(_errorHandlingMiddleware.errorHandlingMiddleware);

  // Tạo một cái server mới bọc thằng app của express để làm real-time với socket.io
  var server = _http["default"].createServer(app);
  // khởi tạo biến io với sever và cors
  var io = (0, _socket["default"])(server, {
    cors: _cors2.corsOptions
  });
  // Xác thực socket qua cookie accessToken -> gắn socket.userId (dùng để phân quyền join room)
  io.use(_socketAuth.socketAuthMiddleware);
  // Lưu io instance vào app để Controller có thể truy cập qua req.app.get('socketio')
  app.set('socketio', io);
  io.on('connection', function (socket) {
    // Mỗi user tham gia 1 room riêng "user:<id>" để nhận thông báo cá nhân (vd lời mời vào board)
    // được emit server-authoritative từ controller, thay vì broadcast cho tất cả.
    if (socket.userId) socket.join("user:".concat(socket.userId));
    (0, _cardCommentSocket.cardCommentSocket)(io, socket);
  });

  // môi trường production
  if (_environment.env.BUILD_MODE === 'production') {
    // Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(process.env.PORT, function () {
      console.log("3. Production: Hello ".concat(_environment.env.AUTHOR, ", I am running at port: ").concat(process.env.PORT, "/"));
    });
  } else {
    // môi trường local dev
    // Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(_environment.env.LOCAL_DEV_APP_PORT, _environment.env.LOCAL_DEV_APP_HOST, function () {
      console.log("3. Local: Hello ".concat(_environment.env.AUTHOR, ", I am running at ").concat(_environment.env.LOCAL_DEV_APP_HOST, ":").concat(_environment.env.LOCAL_DEV_APP_PORT, "/"));
    });
  }
  (0, _asyncExitHook["default"])(function () {
    console.log('4. disconnecting MongoDB Cloud Atlas...');
    (0, _mongodb.CLOSE_DB)();
    console.log('5. Disconnected!');
  });
};

//chỉ khi kết nối tới Database thành công thì chúng ta mới start server back-end lên
// cách 2: IIFE
(0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.prev = 0;
        console.log('1. Connecting to mongoDB atlas ...');
        _context.next = 4;
        return (0, _mongodb.CONNECT_DB)();
      case 4:
        console.log('2. Connected to mongoDB atlas');
        // Tạo index cho notifications (idempotent) — best-effort, không chặn khởi động
        _context.prev = 5;
        _context.next = 8;
        return _notificationModel.notificationModel.initIndexes();
      case 8:
        _context.next = 13;
        break;
      case 10:
        _context.prev = 10;
        _context.t0 = _context["catch"](5);
        console.error('notification initIndexes failed:', _context.t0 === null || _context.t0 === void 0 ? void 0 : _context.t0.message);
      case 13:
        START_SERVER();
        _context.next = 20;
        break;
      case 16:
        _context.prev = 16;
        _context.t1 = _context["catch"](0);
        console.log(_context.t1);
        process.exit(0);
      case 20:
      case "end":
        return _context.stop();
    }
  }, _callee, null, [[0, 16], [5, 10]]);
}))();

//chỉ khi kết nối tới Database thành công thì chúng ta mới start server back-end lên
// cách 1
// console.log('1. Connecting to mongoDB atlas ...')
// CONNECT_DB()
//   .then(() => console.log('2. Connected to mongoDB atlas'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.log(error)
//     process.exit(0)
//   })