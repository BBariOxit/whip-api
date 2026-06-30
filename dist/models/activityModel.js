"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activityModel = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _joi = _interopRequireDefault(require("joi"));
var _mongodb = require("../config/mongodb");
var _mongodb2 = require("mongodb");
var _validators = require("../utils/validators");
var _constants = require("../utils/constants");
var _Joi$string;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// Define Collection (name & schema)
var ACTIVITY_COLLECTION_NAME = 'activities';
var ACTIVITY_COLLECTION_SCHEMA = _joi["default"].object({
  cardId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  userId: _joi["default"].string().required().pattern(_validators.OBJECT_ID_RULE).message(_validators.OBJECT_ID_RULE_MESSAGE),
  userEmail: _joi["default"].string().required(),
  userAvatar: _joi["default"].string().allow(null)["default"](null),
  userDisplayName: _joi["default"].string().required(),
  // Loại hành động
  actionType: (_Joi$string = _joi["default"].string()).valid.apply(_Joi$string, (0, _toConsumableArray2["default"])(Object.values(_constants.ACTIVITY_ACTION_TYPES))).required(),
  // Nội dung mô tả hành động (VD: "đã đánh dấu hoàn thành")
  content: _joi["default"].string().required(),
  // Dữ liệu bổ sung (VD: { newDate: 1717430400000 }) — FE tự format theo timezone user
  metadata: _joi["default"].object().allow(null)["default"](null),
  createdAt: _joi["default"].date().timestamp('javascript')["default"](Date.now)
});
var validateBeforeCreate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return ACTIVITY_COLLECTION_SCHEMA.validateAsync(data, {
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
    var validData, newActivity, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return validateBeforeCreate(data);
        case 3:
          validData = _context2.sent;
          newActivity = _objectSpread(_objectSpread({}, validData), {}, {
            cardId: new _mongodb2.ObjectId(validData.cardId),
            userId: new _mongodb2.ObjectId(validData.userId)
          });
          _context2.next = 7;
          return (0, _mongodb.GET_DB)().collection(ACTIVITY_COLLECTION_NAME).insertOne(newActivity);
        case 7:
          result = _context2.sent;
          return _context2.abrupt("return", result);
        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          throw new Error(_context2.t0);
        case 14:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 11]]);
  }));
  return function createNew(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Lấy danh sách activities theo cardId, sort mới nhất lên đầu, có phân trang
 */
var getActivitiesByCardId = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(cardId) {
    var page,
      limit,
      skip,
      query,
      _yield$Promise$all,
      _yield$Promise$all2,
      activities,
      total,
      _args3 = arguments;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          page = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 1;
          limit = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : 10;
          _context3.prev = 2;
          skip = (page - 1) * limit;
          query = {
            cardId: new _mongodb2.ObjectId(cardId)
          };
          _context3.next = 7;
          return Promise.all([(0, _mongodb.GET_DB)().collection(ACTIVITY_COLLECTION_NAME).find(query).sort({
            createdAt: -1
          }).skip(skip).limit(limit).toArray(), (0, _mongodb.GET_DB)().collection(ACTIVITY_COLLECTION_NAME).countDocuments(query)]);
        case 7:
          _yield$Promise$all = _context3.sent;
          _yield$Promise$all2 = (0, _slicedToArray2["default"])(_yield$Promise$all, 2);
          activities = _yield$Promise$all2[0];
          total = _yield$Promise$all2[1];
          return _context3.abrupt("return", {
            activities: activities,
            total: total
          });
        case 14:
          _context3.prev = 14;
          _context3.t0 = _context3["catch"](2);
          throw new Error(_context3.t0);
        case 17:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[2, 14]]);
  }));
  return function getActivitiesByCardId(_x3) {
    return _ref3.apply(this, arguments);
  };
}();
var activityModel = {
  ACTIVITY_COLLECTION_NAME: ACTIVITY_COLLECTION_NAME,
  ACTIVITY_COLLECTION_SCHEMA: ACTIVITY_COLLECTION_SCHEMA,
  createNew: createNew,
  getActivitiesByCardId: getActivitiesByCardId
};
exports.activityModel = activityModel;