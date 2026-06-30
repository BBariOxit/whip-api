"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invitationModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _joi = _interopRequireDefault(require("joi"));
var _mongodb = require("mongodb");
var _mongodb2 = require("../config/mongodb");
var _validators = require("../utils/validators");
var _constants = require("../utils/constants");
var _userModel = require("./userModel");
var _boardModel = require("./boardModel");
var _workspaceModel = require("./workspaceModel");
var _Joi$string$required, _Joi$string$required2, _Joi$string$required3;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// Define Collection (name & schema)
var INVITATION_COLLECTION_NAME = 'invitations';
var INVITATION_COLLECTION_SCHEMA = _joi["default"].object({
  inviterId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  // người đi mời
  inviteeId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  // người được mời
  type: (_Joi$string$required = _joi["default"].string().required()).valid.apply(_Joi$string$required, (0, _toConsumableArray2["default"])(Object.values(_constants.INVITATION_TYPES))),
  // Lời mời là board thì sẽ lưu thêm dữ liệu boardInvitation - optional
  boardInvitation: _joi["default"].object({
    boardId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
    status: (_Joi$string$required2 = _joi["default"].string().required()).valid.apply(_Joi$string$required2, (0, _toConsumableArray2["default"])(Object.values(_constants.BOARD_INVITATION_STATUS)))
  }).optional(),
  // Lời mời vào workspace
  workspaceInvitation: _joi["default"].object({
    workspaceId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
    status: (_Joi$string$required3 = _joi["default"].string().required()).valid.apply(_Joi$string$required3, (0, _toConsumableArray2["default"])(Object.values(_constants.BOARD_INVITATION_STATUS)))
  }).optional(),
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now),
  updatedAt: _joi["default"].date().timestamp('javascript')["default"](null),
  _destroy: _joi["default"]["boolean"]()["default"](false)
});
var INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt'];
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return INVITATION_COLLECTION_SCHEMA.validateAsync(data, {
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
var createNewBoardInvitation = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
    var validData, newInvitationToAdd, createdInvitation;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          newInvitationToAdd = _objectSpread(_objectSpread({}, validData), {}, {
            inviterId: new _mongodb.ObjectId(validData.inviterId),
            inviteeId: new _mongodb.ObjectId(validData.inviteeId)
          });
          if (validData.boardInvitation) {
            newInvitationToAdd.boardInvitation = _objectSpread(_objectSpread({}, validData.boardInvitation), {}, {
              boardId: new _mongodb.ObjectId(validData.boardInvitation.boardId)
            });
          }
          _context2.next = 8;
          return (0, _mongodb2.GET_DB)().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd);
        case 8:
          createdInvitation = _context2.sent;
          return _context2.abrupt("return", createdInvitation);
        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 15:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 12]]);
  }));
  return function createNewBoardInvitation(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
var createNewWorkspaceInvitation = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(data) {
    var validData, newInvitationToAdd, createdInvitation;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context3.sent;
          newInvitationToAdd = _objectSpread(_objectSpread({}, validData), {}, {
            inviterId: new _mongodb.ObjectId(validData.inviterId),
            inviteeId: new _mongodb.ObjectId(validData.inviteeId)
          });
          if (validData.workspaceInvitation) {
            newInvitationToAdd.workspaceInvitation = _objectSpread(_objectSpread({}, validData.workspaceInvitation), {}, {
              workspaceId: new _mongodb.ObjectId(validData.workspaceInvitation.workspaceId)
            });
          }
          _context3.next = 8;
          return (0, _mongodb2.GET_DB)().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd);
        case 8:
          createdInvitation = _context3.sent;
          return _context3.abrupt("return", createdInvitation);
        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](0);
          throw new Error(_context3.t0);
        case 15:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 12]]);
  }));
  return function createNewWorkspaceInvitation(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var findOneById = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(invitationId) {
    var result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return (0, _mongodb2.GET_DB)().collection(INVITATION_COLLECTION_NAME).findOne({
            _id: new _mongodb.ObjectId(invitationId)
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
  return function findOneById(_x4) {
    return _ref4.apply(this, arguments);
  };
}();
var update = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(invitationId, updateData) {
    var result;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          Object.keys(updateData).forEach(function (fieldName) {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
              delete updateData[fieldName];
            }
          });
          if (updateData.boardInvitation) {
            updateData.boardInvitation = _objectSpread(_objectSpread({}, updateData.boardInvitation), {}, {
              boardId: new _mongodb.ObjectId(updateData.boardInvitation.boardId)
            });
          }
          _context5.next = 5;
          return (0, _mongodb2.GET_DB)().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate({
            _id: new _mongodb.ObjectId(invitationId)
          }, {
            $set: updateData
          }, {
            returnDocument: 'after'
          } // sẽ trả về kết quả mới sau khi cập nhật
          );
        case 5:
          result = _context5.sent;
          return _context5.abrupt("return", result);
        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](0);
          throw new Error(_context5.t0);
        case 12:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 9]]);
  }));
  return function update(_x5, _x6) {
    return _ref5.apply(this, arguments);
  };
}();

// query tổng hợp (aggregate) để lấy những bản ghi invitation thuộc một user cụ thể
var findByUser = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(userId) {
    var queryConditions, results;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          queryConditions = [{
            inviteeId: new _mongodb.ObjectId(userId)
          }, {
            _destroy: false
          }];
          _context6.next = 4;
          return (0, _mongodb2.GET_DB)().collection(INVITATION_COLLECTION_NAME).aggregate([{
            $match: {
              $and: queryConditions
            }
          }, {
            $lookup: {
              from: _userModel.userModel.USER_COLLECTION_NAME,
              localField: 'inviterId',
              // người đi mời
              foreignField: '_id',
              as: 'inviter',
              pipeline: [{
                $project: {
                  'password': 0,
                  'verifyToken': 0
                }
              }]
            }
          }, {
            $lookup: {
              from: _userModel.userModel.USER_COLLECTION_NAME,
              localField: 'inviteeId',
              // người được mời
              foreignField: '_id',
              as: 'invitee',
              pipeline: [{
                $project: {
                  'password': 0,
                  'verifyToken': 0
                }
              }]
            }
          }, {
            $lookup: {
              from: _boardModel.boardModel.BOARD_COLLECTION_NAME,
              localField: 'boardInvitation.boardId',
              // thông tin board được invite
              foreignField: '_id',
              as: 'board'
            }
          }, {
            $lookup: {
              from: _workspaceModel.workspaceModel.WORKSPACE_COLLECTION_NAME,
              localField: 'workspaceInvitation.workspaceId',
              // thông tin workspace được invite
              foreignField: '_id',
              as: 'workspace'
            }
          }]).toArray();
        case 4:
          results = _context6.sent;
          return _context6.abrupt("return", results);
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
  return function findByUser(_x7) {
    return _ref6.apply(this, arguments);
  };
}();
var invitationModel = {
  INVITATION_COLLECTION_NAME: INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA: INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation: createNewBoardInvitation,
  createNewWorkspaceInvitation: createNewWorkspaceInvitation,
  findOneById: findOneById,
  update: update,
  findByUser: findByUser
};
exports.invitationModel = invitationModel;