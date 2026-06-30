"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _userModel = require("../models/userModel");
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _uuid = require("uuid");
var _formatter = require("../utils/formatter");
var _brevoProvider = require("../providers/brevoProvider");
var _environment = require("../config/environment");
var _JwtProvider = require("../providers/JwtProvider");
var _CloudinaryProvider = require("../providers/CloudinaryProvider");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(reqBody) {
    var existUser, nameFromEmail, newUser, createdUser, getNewUser, verificationLink, customSubject, customHTMLContent;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _userModel.userModel.findOneByEmail(reqBody.email);
        case 3:
          existUser = _context.sent;
          if (!existUser) {
            _context.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.CONFLICT, 'Email already exists');
        case 6:
          // tạo data để lưu vào db
          // phần trước dấu @ là tên của người dùng. vd: phanbao@gmail.com -> nameFromEmail = phanbao
          nameFromEmail = reqBody.email.split('@')[0];
          newUser = {
            email: reqBody.email,
            password: _bcryptjs["default"].hashSync(reqBody.password, 8),
            // mã hóa password
            username: nameFromEmail,
            // sẽ hiện thị ra tên người dùng (ví dụ: khi đăng ký tài khoản phanbao@gmail.com thì hiển thị username là phanbao và displayName là phanbao)
            displayName: nameFromEmail,
            verifyToken: (0, _uuid.v4)() // tạo mã token xác thực
          }; // thực hiện lưu thông tin user vào db
          _context.next = 10;
          return _userModel.userModel.createNew(newUser);
        case 10:
          createdUser = _context.sent;
          _context.next = 13;
          return _userModel.userModel.findOneById(createdUser.insertedId);
        case 13:
          getNewUser = _context.sent;
          // Link xác thực tài khoản
          verificationLink = "".concat(_environment.env.BUILD_MODE === 'dev' ? _environment.env.WEBSITE_DOMAIN_DEVELOPMENT : _environment.env.WEBSITE_DOMAIN_PRODUCTION, "/account/verification?email=").concat(getNewUser.email, "&token=").concat(getNewUser.verifyToken); // Tiêu đề email
          customSubject = 'Confirm your account - Whip App'; // Nội dung email
          customHTMLContent = "\n      <h3>Welcome to Whip App!</h3>\n      <p>Please click the link below to verify your account:</p>\n      <a href=\"".concat(verificationLink, "\">Verify Account</a>"); // gửi email cho người dùng xác thực tài khoản
          _context.next = 19;
          return _brevoProvider.brevoProvider.sendEmail(getNewUser.email, customSubject, customHTMLContent);
        case 19:
          return _context.abrupt("return", (0, _formatter.pickUser)(getNewUser));
        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](0);
          throw _context.t0;
        case 25:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 22]]);
  }));
  return function createNew(_x) {
    return _ref.apply(this, arguments);
  };
}();
var verifyAccount = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(reqBody) {
    var existUser, updateData, updatedUser;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return _userModel.userModel.findOneByEmail(reqBody.email);
        case 3:
          existUser = _context2.sent;
          if (existUser) {
            _context2.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Account not found!!');
        case 6:
          if (!existUser.isActive) {
            _context2.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_ACCEPTABLE, 'Account already activated');
        case 8:
          if (!(reqBody.token !== existUser.verifyToken)) {
            _context2.next = 10;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!');
        case 10:
          // nếu như mọi thứ ok thì update thông tin user để verify tài khoản
          updateData = {
            isActive: true,
            verifyToken: null
          }; // update user trong database
          _context2.next = 13;
          return _userModel.userModel.update(existUser._id, updateData);
        case 13:
          updatedUser = _context2.sent;
          return _context2.abrupt("return", (0, _formatter.pickUser)(updatedUser));
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;
        case 20:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 17]]);
  }));
  return function verifyAccount(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
var login = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(reqBody) {
    var existUser, userInfo, accessToken, _refreshToken;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return _userModel.userModel.findOneByEmail(reqBody.email);
        case 3:
          existUser = _context3.sent;
          if (existUser) {
            _context3.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Account not found!!');
        case 6:
          if (existUser.isActive) {
            _context3.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_ACCEPTABLE, 'your account is not activated');
        case 8:
          if (_bcryptjs["default"].compareSync(reqBody.password, existUser.password)) {
            _context3.next = 10;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_ACCEPTABLE, 'your email or password is incorrect');
        case 10:
          // Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
          // tạo thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
          userInfo = {
            _id: existUser._id,
            email: existUser.email
          }; // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
          _context3.next = 13;
          return _JwtProvider.jwtProvider.generateToken(userInfo, _environment.env.ACCESS_TOKEN_SECRET_SIGNATURE, _environment.env.ACCESS_TOKEN_LIFE
          // 5 // 5 giây để test accessToken hết hạn
          );
        case 13:
          accessToken = _context3.sent;
          _context3.next = 16;
          return _JwtProvider.jwtProvider.generateToken(userInfo, _environment.env.REFRESH_TOKEN_SECRET_SIGNATURE, _environment.env.REFRESH_TOKEN_LIFE
          // 15 // 15 giây để test refreshToken hết hạn
          );
        case 16:
          _refreshToken = _context3.sent;
          return _context3.abrupt("return", _objectSpread({
            accessToken: accessToken,
            refreshToken: _refreshToken
          }, (0, _formatter.pickUser)(existUser)));
        case 20:
          _context3.prev = 20;
          _context3.t0 = _context3["catch"](0);
          throw _context3.t0;
        case 23:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 20]]);
  }));
  return function login(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var refreshToken = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(clientRefreshToken) {
    var refreshTokenDecoded, userInfo, accessToken;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return _JwtProvider.jwtProvider.verifyToken(clientRefreshToken, _environment.env.REFRESH_TOKEN_SECRET_SIGNATURE);
        case 3:
          refreshTokenDecoded = _context4.sent;
          // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới.
          userInfo = {
            _id: refreshTokenDecoded._id,
            email: refreshTokenDecoded.email
          }; // Tạo accessToken mới
          _context4.next = 7;
          return _JwtProvider.jwtProvider.generateToken(userInfo, _environment.env.ACCESS_TOKEN_SECRET_SIGNATURE,
          // 5 // 5 giây để test accessToken hết hạn
          _environment.env.ACCESS_TOKEN_LIFE // 1 tiếng
          );
        case 7:
          accessToken = _context4.sent;
          return _context4.abrupt("return", {
            accessToken: accessToken
          });
        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](0);
          throw _context4.t0;
        case 14:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 11]]);
  }));
  return function refreshToken(_x4) {
    return _ref4.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(userId, reqBody, userAvatarFile) {
    var existUser, updatedUser, uploadResult;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return _userModel.userModel.findOneById(userId);
        case 3:
          existUser = _context5.sent;
          if (existUser) {
            _context5.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Account not found!');
        case 6:
          if (existUser.isActive) {
            _context5.next = 8;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!');
        case 8:
          // khởi tạo kq update user ban đầu là empty
          updatedUser = {}; // Trường hợp change password
          if (!(reqBody.current_password && reqBody.new_password)) {
            _context5.next = 17;
            break;
          }
          if (_bcryptjs["default"].compareSync(reqBody.current_password, existUser.password)) {
            _context5.next = 12;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect');
        case 12:
          _context5.next = 14;
          return _userModel.userModel.update(userId, {
            password: _bcryptjs["default"].hashSync(reqBody.new_password, 8)
          });
        case 14:
          updatedUser = _context5.sent;
          _context5.next = 30;
          break;
        case 17:
          if (!userAvatarFile) {
            _context5.next = 27;
            break;
          }
          _context5.next = 20;
          return _CloudinaryProvider.cloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users');
        case 20:
          uploadResult = _context5.sent;
          console.log('uploadResult: ', uploadResult);
          // lưu lại secure_url của cái file ảnh vào trong db
          _context5.next = 24;
          return _userModel.userModel.update(userId, {
            avatar: uploadResult.secure_url
          });
        case 24:
          updatedUser = _context5.sent;
          _context5.next = 30;
          break;
        case 27:
          _context5.next = 29;
          return _userModel.userModel.update(userId, reqBody);
        case 29:
          updatedUser = _context5.sent;
        case 30:
          return _context5.abrupt("return", (0, _formatter.pickUser)(updatedUser));
        case 33:
          _context5.prev = 33;
          _context5.t0 = _context5["catch"](0);
          throw _context5.t0;
        case 36:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 33]]);
  }));
  return function update(_x5, _x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Helper function dùng chung: tạo tokens cho OAuth user
 */
var _generateTokensForOAuthUser = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(user) {
    var userInfo, accessToken, refreshToken;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          userInfo = {
            _id: user._id,
            email: user.email
          };
          _context6.next = 3;
          return _JwtProvider.jwtProvider.generateToken(userInfo, _environment.env.ACCESS_TOKEN_SECRET_SIGNATURE, _environment.env.ACCESS_TOKEN_LIFE);
        case 3:
          accessToken = _context6.sent;
          _context6.next = 6;
          return _JwtProvider.jwtProvider.generateToken(userInfo, _environment.env.REFRESH_TOKEN_SECRET_SIGNATURE, _environment.env.REFRESH_TOKEN_LIFE);
        case 6:
          refreshToken = _context6.sent;
          return _context6.abrupt("return", _objectSpread({
            accessToken: accessToken,
            refreshToken: refreshToken
          }, (0, _formatter.pickUser)(user)));
        case 8:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return function _generateTokensForOAuthUser(_x8) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Google Login - Dùng access_token từ Google để lấy user info và đăng nhập / tạo user mới
 */
var googleLogin = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(accessToken) {
    var userInfoResponse, googleUser, email, name, picture, user, nameFromEmail, newUser, createdUser;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              'Authorization': "Bearer ".concat(accessToken)
            }
          });
        case 3:
          userInfoResponse = _context7.sent;
          _context7.next = 6;
          return userInfoResponse.json();
        case 6:
          googleUser = _context7.sent;
          if (googleUser.email) {
            _context7.next = 9;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Cannot get email from Google account');
        case 9:
          email = googleUser.email, name = googleUser.name, picture = googleUser.picture; // Tìm user theo email
          _context7.next = 12;
          return _userModel.userModel.findOneByEmail(email);
        case 12:
          user = _context7.sent;
          if (user) {
            _context7.next = 24;
            break;
          }
          // Tạo user mới nếu chưa tồn tại
          nameFromEmail = email.split('@')[0];
          newUser = {
            email: email,
            password: null,
            username: nameFromEmail,
            displayName: name || nameFromEmail,
            avatar: picture || null,
            isActive: true,
            verifyToken: null,
            loginType: 'google'
          };
          _context7.next = 18;
          return _userModel.userModel.createNew(newUser);
        case 18:
          createdUser = _context7.sent;
          _context7.next = 21;
          return _userModel.userModel.findOneById(createdUser.insertedId);
        case 21:
          user = _context7.sent;
          _context7.next = 28;
          break;
        case 24:
          if (user.isActive) {
            _context7.next = 28;
            break;
          }
          _context7.next = 27;
          return _userModel.userModel.update(user._id, {
            isActive: true,
            verifyToken: null
          });
        case 27:
          user = _context7.sent;
        case 28:
          _context7.next = 30;
          return _generateTokensForOAuthUser(user);
        case 30:
          return _context7.abrupt("return", _context7.sent);
        case 33:
          _context7.prev = 33;
          _context7.t0 = _context7["catch"](0);
          throw _context7.t0;
        case 36:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 33]]);
  }));
  return function googleLogin(_x9) {
    return _ref7.apply(this, arguments);
  };
}();

/**
 * GitHub Login - Đổi authorization code lấy access_token, rồi lấy user info
 */
var githubLogin = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(code) {
    var clientId, clientSecret, tokenResponse, tokenData, userResponse, githubUser, email, _emails$, emailsResponse, emails, primaryEmail, user, nameFromEmail, newUser, createdUser;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          // Chọn client ID/Secret phù hợp với môi trường
          clientId = _environment.env.BUILD_MODE === 'production' ? _environment.env.GITHUB_CLIENT_ID_PRODUCTION : _environment.env.GITHUB_CLIENT_ID_LOCAL;
          clientSecret = _environment.env.BUILD_MODE === 'production' ? _environment.env.GITHUB_CLIENT_SECRET_PRODUCTION : _environment.env.GITHUB_CLIENT_SECRET_LOCAL; // Bước 1: Đổi authorization code lấy access_token
          _context8.next = 5;
          return fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              code: code
            })
          });
        case 5:
          tokenResponse = _context8.sent;
          _context8.next = 8;
          return tokenResponse.json();
        case 8:
          tokenData = _context8.sent;
          if (!(tokenData.error || !tokenData.access_token)) {
            _context8.next = 11;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, tokenData.error_description || 'Failed to get GitHub access token');
        case 11:
          _context8.next = 13;
          return fetch('https://api.github.com/user', {
            headers: {
              'Authorization': "Bearer ".concat(tokenData.access_token),
              'Accept': 'application/json'
            }
          });
        case 13:
          userResponse = _context8.sent;
          _context8.next = 16;
          return userResponse.json();
        case 16:
          githubUser = _context8.sent;
          // Bước 3: Lấy email (có thể private nên cần gọi thêm API emails)
          email = githubUser.email;
          if (email) {
            _context8.next = 27;
            break;
          }
          _context8.next = 21;
          return fetch('https://api.github.com/user/emails', {
            headers: {
              'Authorization': "Bearer ".concat(tokenData.access_token),
              'Accept': 'application/json'
            }
          });
        case 21:
          emailsResponse = _context8.sent;
          _context8.next = 24;
          return emailsResponse.json();
        case 24:
          emails = _context8.sent;
          // Lấy email primary và đã verified
          primaryEmail = emails.find(function (e) {
            return e.primary && e.verified;
          });
          email = primaryEmail ? primaryEmail.email : ((_emails$ = emails[0]) === null || _emails$ === void 0 ? void 0 : _emails$.email) || null;
        case 27:
          if (email) {
            _context8.next = 29;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Cannot get email from GitHub account');
        case 29:
          _context8.next = 31;
          return _userModel.userModel.findOneByEmail(email);
        case 31:
          user = _context8.sent;
          if (user) {
            _context8.next = 43;
            break;
          }
          // Tạo user mới nếu chưa tồn tại
          nameFromEmail = email.split('@')[0];
          newUser = {
            email: email,
            password: null,
            username: githubUser.login || nameFromEmail,
            displayName: githubUser.name || githubUser.login || nameFromEmail,
            avatar: githubUser.avatar_url || null,
            isActive: true,
            verifyToken: null,
            loginType: 'github'
          };
          _context8.next = 37;
          return _userModel.userModel.createNew(newUser);
        case 37:
          createdUser = _context8.sent;
          _context8.next = 40;
          return _userModel.userModel.findOneById(createdUser.insertedId);
        case 40:
          user = _context8.sent;
          _context8.next = 47;
          break;
        case 43:
          if (user.isActive) {
            _context8.next = 47;
            break;
          }
          _context8.next = 46;
          return _userModel.userModel.update(user._id, {
            isActive: true,
            verifyToken: null
          });
        case 46:
          user = _context8.sent;
        case 47:
          _context8.next = 49;
          return _generateTokensForOAuthUser(user);
        case 49:
          return _context8.abrupt("return", _context8.sent);
        case 52:
          _context8.prev = 52;
          _context8.t0 = _context8["catch"](0);
          throw _context8.t0;
        case 55:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 52]]);
  }));
  return function githubLogin(_x0) {
    return _ref8.apply(this, arguments);
  };
}();
var userService = {
  createNew: createNew,
  verifyAccount: verifyAccount,
  login: login,
  refreshToken: refreshToken,
  update: update,
  googleLogin: googleLogin,
  githubLogin: githubLogin
};
exports.userService = userService;