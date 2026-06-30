"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activityController = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _activityService = require("../services/activityService");
var getActivities = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var cardId, page, limit, result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          cardId = req.query.cardId;
          page = Math.max(1, parseInt(req.query.page) || 1);
          limit = parseInt(req.query.limit) || 10;
          _context.next = 6;
          return _activityService.activityService.getActivities(cardId, page, limit);
        case 6:
          result = _context.sent;
          res.status(_httpStatusCodes.StatusCodes.OK).json(result);
          _context.next = 13;
          break;
        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          next(_context.t0);
        case 13:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 10]]);
  }));
  return function getActivities(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var activityController = {
  getActivities: getActivities
};
exports.activityController = activityController;