"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _userService = require("../services/userService");
var _ms = _interopRequireDefault(require("ms"));
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var createdUser;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _userService.userService.createNew(req.body);
        case 3:
          createdUser = _context.sent;
          // Trả về kết quả cho phía Client với mã 201 (CREATED)
          res.status(_httpStatusCodes.StatusCodes.CREATED).json(createdUser);
          _context.next = 10;
          break;
        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          next(_context.t0);
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 7]]);
  }));
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var verifyAccount = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return _userService.userService.verifyAccount(req.body);
        case 3:
          result = _context2.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context2.next = 10;
          break;
        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          next(_context2.t0);
        case 10:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 7]]);
  }));
  return function verifyAccount(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var login = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return _userService.userService.login(req.body);
        case 3:
          result = _context3.sent;
          // xử lý trả về http only cookie cho phía trình duyệt
          res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: (0, _ms["default"])('14 days')
          });
          res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: (0, _ms["default"])('14 days')
          });
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context3.next = 12;
          break;
        case 9:
          _context3.prev = 9;
          _context3.t0 = _context3["catch"](0);
          next(_context3.t0);
        case 12:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 9]]);
  }));
  return function login(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();
var logout = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          try {
            // Xóa cookie - đơn giản là làm ngược lại so với việc gán cookie ở hàm login
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(_httpStatusCodes.StatusCodes.OK).json({
              loggedOut: true
            });
          } catch (error) {
            next(error);
          }
        case 1:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function logout(_x0, _x1, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var refreshToken = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var _req$cookies, result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return _userService.userService.refreshToken((_req$cookies = req.cookies) === null || _req$cookies === void 0 ? void 0 : _req$cookies.refreshToken);
        case 3:
          result = _context5.sent;
          res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: (0, _ms["default"])('14 days')
          });
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context5.next = 11;
          break;
        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          next(new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Please Sign In!'));
        case 11:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 8]]);
  }));
  return function refreshToken(_x11, _x12, _x13) {
    return _ref5.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var userId, userAvatarFile, updatedUser;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          userId = req.jwtDecoded._id;
          userAvatarFile = req.file; // console.log('userAvatarFile: ', userAvatarFile)
          _context6.next = 5;
          return _userService.userService.update(userId, req.body, userAvatarFile);
        case 5:
          updatedUser = _context6.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(updatedUser);
          _context6.next = 12;
          break;
        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          next(_context6.t0);
        case 12:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 9]]);
  }));
  return function update(_x14, _x15, _x16) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Google Login Controller
 */
var googleLogin = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return _userService.userService.googleLogin(req.body.credential);
        case 3:
          result = _context7.sent;
          // Set cookies giống hệt hàm login
          res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: (0, _ms["default"])('14 days')
          });
          res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: (0, _ms["default"])('14 days')
          });
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context7.next = 12;
          break;
        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          next(_context7.t0);
        case 12:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 9]]);
  }));
  return function googleLogin(_x17, _x18, _x19) {
    return _ref7.apply(this, arguments);
  };
}();

/**
 * GitHub Login Controller
 */
var githubLogin = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return _userService.userService.githubLogin(req.body.code);
        case 3:
          result = _context8.sent;
          // Set cookies giống hệt hàm login
          res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: (0, _ms["default"])('14 days')
          });
          res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: (0, _ms["default"])('14 days')
          });
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context8.next = 12;
          break;
        case 9:
          _context8.prev = 9;
          _context8.t0 = _context8["catch"](0);
          next(_context8.t0);
        case 12:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 9]]);
  }));
  return function githubLogin(_x20, _x21, _x22) {
    return _ref8.apply(this, arguments);
  };
}();
var userController = {
  createNew: createNew,
  verifyAccount: verifyAccount,
  login: login,
  logout: logout,
  refreshToken: refreshToken,
  update: update,
  googleLogin: googleLogin,
  githubLogin: githubLogin
};
exports.userController = userController;