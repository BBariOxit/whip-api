"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _joi = _interopRequireDefault(require("joi"));
var _mongodb = require("mongodb");
var _mongodb2 = require("../config/mongodb");
var _validators = require("../utils/validators");
var _Joi$string;
// Define tạm 2 roles cho user
var USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
};

// Define Collection (name & schema)
var USER_COLLECTION_NAME = 'users';
var USER_COLLECTION_SCHEMA = _joi["default"].object({
  email: _joi["default"].string().required().pattern(_validators.EMAIL_RULE).message(_validators.EMAIL_RULE_MESSAGE),
  // unique
  password: _joi["default"].string().optional().allow(null)["default"](null),
  // username cắt ra từ email sẽ có khả năng không unique bởi vì sẽ có những tên email trùng nhau nhưng từ các nhà cung cấp khác nhau
  username: _joi["default"].string().required().trim().strict(),
  displayName: _joi["default"].string().required().trim().strict(),
  avatar: _joi["default"].string().allow(null)["default"](null),
  role: (_Joi$string = _joi["default"].string()).valid.apply(_Joi$string, (0, _toConsumableArray2["default"])(Object.values(USER_ROLES)))["default"](USER_ROLES.CLIENT),
  isActive: _joi["default"]["boolean"]()["default"](false),
  verifyToken: _joi["default"].string().allow(null),
  // Phân biệt loại đăng nhập: email/password, google, github
  loginType: _joi["default"].string().valid('email', 'google', 'github')["default"]('email'),
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
  updatedAt: _joi["default"].date().timestamp('javascript')["default"](null),
  _destroy: _joi["default"]["boolean"]()["default"](false)
});

// Chỉ định ra những Fields mà chúng ta không muốn cho phép cập nhật trong hàm update()
var INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt'];
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return USER_COLLECTION_SCHEMA.validateAsync(data, {
            abortEarly: false
          });
        case 2:
          return _context.abrupt("return", _context.sent);
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function validateBeforeCreate(_x) {
    return _ref.apply(this, arguments);
  };
}();
var createNew = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
    var validData, createdUser;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          _context2.next = 6;
          return (0, _mongodb2.GET_DB)().collection(USER_COLLECTION_NAME).insertOne(validData);
        case 6:
          createdUser = _context2.sent;
          return _context2.abrupt("return", createdUser);
        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 13:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 10]]);
  }));
  return function createNew(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
var findOneById = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(userId) {
    var result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return (0, _mongodb2.GET_DB)().collection(USER_COLLECTION_NAME).findOne({
            _id: new _mongodb.ObjectId(userId)
          });
        case 3:
          result = _context3.sent;
          return _context3.abrupt("return", result);
        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          throw new Error(_context3.t0);
        case 10:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 7]]);
  }));
  return function findOneById(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var findOneByEmail = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(emailValue) {
    var result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return (0, _mongodb2.GET_DB)().collection(USER_COLLECTION_NAME).findOne({
            email: emailValue
          });
        case 3:
          result = _context4.sent;
          return _context4.abrupt("return", result);
        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](0);
          throw new Error(_context4.t0);
        case 10:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 7]]);
  }));
  return function findOneByEmail(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

// Lấy nhiều user theo danh sách id (dùng để đối chiếu @mention với handle của member)
var findManyByIds = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(userIds) {
    var objectIds, results;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          objectIds = (userIds || []).map(function (id) {
            return new _mongodb.ObjectId(id);
          });
          _context5.next = 4;
          return (0, _mongodb2.GET_DB)().collection(USER_COLLECTION_NAME).find({
            _id: {
              $in: objectIds
            }
          }).toArray();
        case 4:
          results = _context5.sent;
          return _context5.abrupt("return", results);
        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          throw new Error(_context5.t0);
        case 11:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 8]]);
  }));
  return function findManyByIds(_x5) {
    return _ref5.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(userId, updateData) {
    var result;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
          Object.keys(updateData).forEach(function (fieldName) {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
              delete updateData[fieldName];
            }
          });
          _context6.next = 4;
          return (0, _mongodb2.GET_DB)().collection(USER_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(userId)
          }, {
            $set: updateData
          }, {
            returnDocument: 'after'
          } // sẽ trả về kết quả mới sau khi cập nhật
          );
        case 4:
          result = _context6.sent;
          return _context6.abrupt("return", result);
        case 8:
          _context6.prev = 8;
          _context6.t0 = _context6["catch"](0);
          throw new Error(_context6.t0);
        case 11:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 8]]);
  }));
  return function update(_x6, _x7) {
    return _ref6.apply(this, arguments);
  };
}();
var userModel = {
  USER_COLLECTION_NAME: USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA: USER_COLLECTION_SCHEMA,
  USER_ROLES: USER_ROLES,
  createNew: createNew,
  findOneById: findOneById,
  findOneByEmail: findOneByEmail,
  findManyByIds: findManyByIds,
  update: update
};
exports.userModel = userModel;