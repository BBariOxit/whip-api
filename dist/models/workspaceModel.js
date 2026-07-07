"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workspaceModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _joi = _interopRequireDefault(require("joi"));
var _mongodb = require("mongodb");
var _mongodb2 = require("../config/mongodb");
var _constants = require("../utils/constants");
var _validators = require("../utils/validators");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var WORKSPACE_COLLECTION_NAME = 'workspaces';

// Tuỳ chọn thông báo mặc định cho mỗi thành viên (cá nhân theo từng workspace)
var DEFAULT_NOTIFICATION_PREFS = {
  memberJoins: true,
  boardChanges: true,
  mentions: true,
  boardActivity: false
};
var NOTIFICATION_PREFS_SCHEMA = _joi["default"].object({
  memberJoins: _joi["default"]["boolean"]()["default"](true),
  boardChanges: _joi["default"]["boolean"]()["default"](true),
  mentions: _joi["default"]["boolean"]()["default"](true),
  boardActivity: _joi["default"]["boolean"]()["default"](false)
})["default"](DEFAULT_NOTIFICATION_PREFS);
var WORKSPACE_COLLECTION_SCHEMA = _joi["default"].object({
  title: _joi["default"].string().required().min(3).max(50).trim().strict(),
  description: _joi["default"].string().max(255).trim().strict()["default"](''),
  // Logo (Cloudinary secure_url)
  logo: _joi["default"].string().uri().allow(null)["default"](null),
  // Access & Security settings
  visibility: _joi["default"].string().valid('private', 'public')["default"]('private'),
  invitePermission: _joi["default"].string().valid('admin', 'all')["default"]('admin'),
  boardCreation: _joi["default"].string().valid('all', 'admin')["default"]('all'),
  boardDeletion: _joi["default"].string().valid('admin', 'all')["default"]('admin'),
  // Embedded members array
  members: _joi["default"].array().items(_joi["default"].object({
    userId: _joi["default"].string().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE).allow(null)["default"](null),
    email: _joi["default"].string().pattern(_validators.EMAIL_RULE).message(_validators.EMAIL_RULE_MESSAGE).required(),
    role: _joi["default"].string().valid(_constants.WORKSPACE_ROLES.OWNER, _constants.WORKSPACE_ROLES.ADMIN, _constants.WORKSPACE_ROLES.MEMBER)["default"](_constants.WORKSPACE_ROLES.MEMBER),
    status: _joi["default"].string().valid('active', 'pending')["default"]('active'),
    inviteToken: _joi["default"].string().allow(null)["default"](null),
    joinedAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
    // Tuỳ chọn thông báo cá nhân của thành viên này trong workspace
    notificationPrefs: NOTIFICATION_PREFS_SCHEMA
  }))["default"]([]),
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
  updatedAt: _joi["default"].date().timestamp('javascript')["default"](null),
  _destroy: _joi["default"]["boolean"]()["default"](false)
});

// Hàm tạo Workspace mới — người tạo tự động trở thành Owner
var createNew = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(userId, email, data) {
    var validData, insertData, db, result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return WORKSPACE_COLLECTION_SCHEMA.validateAsync(data, {
            abortEarly: false
          });
        case 3:
          validData = _context.sent;
          insertData = _objectSpread(_objectSpread({}, validData), {}, {
            members: [{
              userId: new _mongodb.ObjectId(userId),
              email: email,
              role: _constants.WORKSPACE_ROLES.OWNER,
              status: 'active',
              inviteToken: null,
              joinedAt: Date.now()
            }]
          });
          db = (0, _mongodb2.GET_DB)();
          _context.next = 8;
          return db.collection(WORKSPACE_COLLECTION_NAME).insertOne(insertData);
        case 8:
          result = _context.sent;
          return _context.abrupt("return", result);
        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          throw new Error(_context.t0);
        case 15:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 12]]);
  }));
  return function createNew(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var findById = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(id) {
    var db, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context2.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOne({
            _id: new _mongodb.ObjectId(id)
          });
        case 4:
          result = _context2.sent;
          return _context2.abrupt("return", result);
        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 11:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 8]]);
  }));
  return function findById(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

// Lấy tất cả workspace mà user là thành viên (bất kể role)
var getWorkspacesByUserId = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(userId) {
    var db, results;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context3.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).find({
            members: {
              $elemMatch: {
                userId: new _mongodb.ObjectId(userId),
                status: 'active'
              }
            },
            _destroy: false
          }).sort({
            createdAt: -1
          }).toArray();
        case 4:
          results = _context3.sent;
          return _context3.abrupt("return", results);
        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          throw new Error(_context3.t0);
        case 11:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 8]]);
  }));
  return function getWorkspacesByUserId(_x5) {
    return _ref3.apply(this, arguments);
  };
}();
var deleteOneById = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(workspaceId) {
    var db, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context4.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).deleteOne({
            _id: new _mongodb.ObjectId(workspaceId)
          });
        case 4:
          result = _context4.sent;
          return _context4.abrupt("return", result);
        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](0);
          throw new Error(_context4.t0);
        case 11:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 8]]);
  }));
  return function deleteOneById(_x6) {
    return _ref4.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(workspaceId, validData) {
    var db, result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context5.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(workspaceId)
          }, {
            $set: validData
          }, {
            returnDocument: 'after'
          });
        case 4:
          result = _context5.sent;
          return _context5.abrupt("return", result);
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
  return function update(_x7, _x8) {
    return _ref5.apply(this, arguments);
  };
}();

// Thêm member mới vào workspace
var addMember = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(workspaceId, userId) {
    var role,
      db,
      result,
      _args6 = arguments;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          role = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : _constants.WORKSPACE_ROLES.MEMBER;
          _context6.prev = 1;
          db = (0, _mongodb2.GET_DB)();
          _context6.next = 5;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(workspaceId)
          }, {
            $push: {
              members: {
                userId: new _mongodb.ObjectId(userId),
                role: role,
                joinedAt: Date.now()
              }
            },
            $set: {
              updatedAt: Date.now()
            }
          }, {
            returnDocument: 'after'
          });
        case 5:
          result = _context6.sent;
          return _context6.abrupt("return", result);
        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](1);
          throw new Error(_context6.t0);
        case 12:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[1, 9]]);
  }));
  return function addMember(_x9, _x0) {
    return _ref6.apply(this, arguments);
  };
}();

// Tìm thành viên theo email trong workspace
var findMemberByEmail = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(workspaceId, email) {
    var db, workspace;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context7.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOne({
            _id: new _mongodb.ObjectId(workspaceId),
            members: {
              $elemMatch: {
                email: email
              }
            }
          });
        case 4:
          workspace = _context7.sent;
          return _context7.abrupt("return", workspace ? workspace.members.find(function (m) {
            return m.email === email;
          }) : null);
        case 8:
          _context7.prev = 8;
          _context7.t0 = _context7["catch"](0);
          throw new Error(_context7.t0);
        case 11:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 8]]);
  }));
  return function findMemberByEmail(_x1, _x10) {
    return _ref7.apply(this, arguments);
  };
}();

// Chấp nhận lời mời (chuyển status pending -> active, gán userId, xóa token)
var acceptInviteMember = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(workspaceId, inviteToken, userId) {
    var db, result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context8.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(workspaceId),
            'members.inviteToken': inviteToken
          }, {
            $set: {
              'members.$.userId': new _mongodb.ObjectId(userId),
              'members.$.status': 'active',
              'members.$.inviteToken': null,
              updatedAt: Date.now()
            }
          }, {
            returnDocument: 'after'
          });
        case 4:
          result = _context8.sent;
          return _context8.abrupt("return", result);
        case 8:
          _context8.prev = 8;
          _context8.t0 = _context8["catch"](0);
          throw new Error(_context8.t0);
        case 11:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 8]]);
  }));
  return function acceptInviteMember(_x11, _x12, _x13) {
    return _ref8.apply(this, arguments);
  };
}();

// Tìm workspace theo invite token
var findByInviteToken = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(inviteToken) {
    var db, result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context9.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOne({
            'members.inviteToken': inviteToken
          });
        case 4:
          result = _context9.sent;
          return _context9.abrupt("return", result);
        case 8:
          _context9.prev = 8;
          _context9.t0 = _context9["catch"](0);
          throw new Error(_context9.t0);
        case 11:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 8]]);
  }));
  return function findByInviteToken(_x14) {
    return _ref9.apply(this, arguments);
  };
}();

// Xóa member ra khỏi workspace (được dùng để xóa member hoặc hủy pending invite)
var removeMember = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(workspaceId, userIdOrEmail) {
    var db, pullCondition, result;
    return _regenerator["default"].wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          db = (0, _mongodb2.GET_DB)(); // Nếu là ID thì xóa theo userId, nếu là email thì xóa theo email (cho pending member)
          pullCondition = userIdOrEmail.includes('@') ? {
            email: userIdOrEmail
          } : {
            userId: new _mongodb.ObjectId(userIdOrEmail)
          };
          _context0.next = 5;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(workspaceId)
          }, {
            $pull: {
              members: pullCondition
            },
            $set: {
              updatedAt: Date.now()
            }
          }, {
            returnDocument: 'after'
          });
        case 5:
          result = _context0.sent;
          return _context0.abrupt("return", result);
        case 9:
          _context0.prev = 9;
          _context0.t0 = _context0["catch"](0);
          throw new Error(_context0.t0);
        case 12:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 9]]);
  }));
  return function removeMember(_x15, _x16) {
    return _ref0.apply(this, arguments);
  };
}();

// Cập nhật role của member
var updateMemberRole = /*#__PURE__*/function () {
  var _ref1 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(workspaceId, userIdOrEmail, newRole) {
    var db, matchCondition, result;
    return _regenerator["default"].wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          matchCondition = userIdOrEmail.includes('@') ? {
            email: userIdOrEmail
          } : {
            userId: new _mongodb.ObjectId(userIdOrEmail)
          };
          _context1.next = 5;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(workspaceId),
            'members': {
              $elemMatch: matchCondition
            }
          }, {
            $set: {
              'members.$.role': newRole,
              updatedAt: Date.now()
            }
          }, {
            returnDocument: 'after'
          });
        case 5:
          result = _context1.sent;
          return _context1.abrupt("return", result);
        case 9:
          _context1.prev = 9;
          _context1.t0 = _context1["catch"](0);
          throw new Error(_context1.t0);
        case 12:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[0, 9]]);
  }));
  return function updateMemberRole(_x17, _x18, _x19) {
    return _ref1.apply(this, arguments);
  };
}();

// Chuyển quyền sở hữu: owner hiện tại -> admin, member được chọn -> owner (atomic)
var transferOwnership = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(workspaceId, currentOwnerUserId, newOwnerUserId) {
    var db, result;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context10.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(workspaceId)
          }, {
            $set: {
              'members.$[oldOwner].role': _constants.WORKSPACE_ROLES.ADMIN,
              'members.$[newOwner].role': _constants.WORKSPACE_ROLES.OWNER,
              updatedAt: Date.now()
            }
          }, {
            arrayFilters: [{
              'oldOwner.userId': new _mongodb.ObjectId(currentOwnerUserId)
            }, {
              'newOwner.userId': new _mongodb.ObjectId(newOwnerUserId)
            }],
            returnDocument: 'after'
          });
        case 4:
          result = _context10.sent;
          return _context10.abrupt("return", result);
        case 8:
          _context10.prev = 8;
          _context10.t0 = _context10["catch"](0);
          throw new Error(_context10.t0);
        case 11:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 8]]);
  }));
  return function transferOwnership(_x20, _x21, _x22) {
    return _ref10.apply(this, arguments);
  };
}();

// Cập nhật tuỳ chọn thông báo cá nhân cho 1 member (set nguyên object cho gọn)
var updateMemberNotificationPrefs = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee11(workspaceId, userId, prefs) {
    var db, result;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context11.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(workspaceId)
          }, {
            $set: {
              'members.$[m].notificationPrefs': prefs,
              updatedAt: Date.now()
            }
          }, {
            arrayFilters: [{
              'm.userId': new _mongodb.ObjectId(userId)
            }],
            returnDocument: 'after'
          });
        case 4:
          result = _context11.sent;
          return _context11.abrupt("return", result);
        case 8:
          _context11.prev = 8;
          _context11.t0 = _context11["catch"](0);
          throw new Error(_context11.t0);
        case 11:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 8]]);
  }));
  return function updateMemberNotificationPrefs(_x23, _x24, _x25) {
    return _ref11.apply(this, arguments);
  };
}();

// Tìm workspace có chứa member cụ thể với role cho phép
// Dùng bởi rbacMiddleware
var findByMemberWithRole = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee12(workspaceId, userId, allowedRoles) {
    var db, result;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context12.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).findOne({
            _id: new _mongodb.ObjectId(workspaceId),
            members: {
              $elemMatch: {
                userId: new _mongodb.ObjectId(userId),
                role: {
                  $in: allowedRoles
                },
                status: 'active'
              }
            }
          });
        case 4:
          result = _context12.sent;
          return _context12.abrupt("return", result);
        case 8:
          _context12.prev = 8;
          _context12.t0 = _context12["catch"](0);
          throw new Error(_context12.t0);
        case 11:
        case "end":
          return _context12.stop();
      }
    }, _callee12, null, [[0, 8]]);
  }));
  return function findByMemberWithRole(_x26, _x27, _x28) {
    return _ref12.apply(this, arguments);
  };
}();

// Lấy workspace detail kèm thông tin user (aggregate lookup)
var getDetailsWithMembers = /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee13(workspaceId) {
    var db, result;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          db = (0, _mongodb2.GET_DB)();
          _context13.next = 4;
          return db.collection(WORKSPACE_COLLECTION_NAME).aggregate([{
            $match: {
              _id: new _mongodb.ObjectId(workspaceId),
              _destroy: false
            }
          },
          // Unwind members array để lookup từng user
          {
            $unwind: {
              path: '$members',
              preserveNullAndEmptyArrays: true
            }
          },
          // Lookup user info cho từng member
          {
            $lookup: {
              from: 'users',
              localField: 'members.userId',
              foreignField: '_id',
              as: 'members.userInfo',
              pipeline: [{
                $project: {
                  password: 0,
                  verifyToken: 0
                }
              }]
            }
          },
          // Unwind userInfo (vì lookup trả về array)
          {
            $unwind: {
              path: '$members.userInfo',
              preserveNullAndEmptyArrays: true
            }
          },
          // Group lại thành 1 workspace document với members array đầy đủ
          {
            $group: {
              _id: '$_id',
              title: {
                $first: '$title'
              },
              description: {
                $first: '$description'
              },
              logo: {
                $first: '$logo'
              },
              // Access & Security settings
              visibility: {
                $first: '$visibility'
              },
              invitePermission: {
                $first: '$invitePermission'
              },
              boardCreation: {
                $first: '$boardCreation'
              },
              boardDeletion: {
                $first: '$boardDeletion'
              },
              createdAt: {
                $first: '$createdAt'
              },
              updatedAt: {
                $first: '$updatedAt'
              },
              _destroy: {
                $first: '$_destroy'
              },
              members: {
                $push: {
                  userId: '$members.userId',
                  role: '$members.role',
                  joinedAt: '$members.joinedAt',
                  status: '$members.status',
                  // Dùng email gốc trong members array (trường hợp pending chưa có userInfo), 
                  // nếu active thì dùng email của userInfo (nhưng thực ra trùng nhau)
                  email: '$members.email',
                  displayName: {
                    $ifNull: ['$members.userInfo.displayName', 'Pending User']
                  },
                  avatar: {
                    $ifNull: ['$members.userInfo.avatar', null]
                  },
                  username: {
                    $ifNull: ['$members.userInfo.username', null]
                  }
                }
              }
            }
          }]).toArray();
        case 4:
          result = _context13.sent;
          return _context13.abrupt("return", result[0] || null);
        case 8:
          _context13.prev = 8;
          _context13.t0 = _context13["catch"](0);
          throw new Error(_context13.t0);
        case 11:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[0, 8]]);
  }));
  return function getDetailsWithMembers(_x29) {
    return _ref13.apply(this, arguments);
  };
}();
var workspaceModel = {
  WORKSPACE_COLLECTION_NAME: WORKSPACE_COLLECTION_NAME,
  WORKSPACE_COLLECTION_SCHEMA: WORKSPACE_COLLECTION_SCHEMA,
  DEFAULT_NOTIFICATION_PREFS: DEFAULT_NOTIFICATION_PREFS,
  updateMemberNotificationPrefs: updateMemberNotificationPrefs,
  createNew: createNew,
  findById: findById,
  getWorkspacesByUserId: getWorkspacesByUserId,
  deleteOneById: deleteOneById,
  update: update,
  addMember: addMember,
  removeMember: removeMember,
  updateMemberRole: updateMemberRole,
  transferOwnership: transferOwnership,
  findByMemberWithRole: findByMemberWithRole,
  getDetailsWithMembers: getDetailsWithMembers,
  findMemberByEmail: findMemberByEmail,
  acceptInviteMember: acceptInviteMember,
  findByInviteToken: findByInviteToken
};
exports.workspaceModel = workspaceModel;