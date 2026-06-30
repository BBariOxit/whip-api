"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invitationService = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _userModel = require("../models/userModel");
var _boardModel = require("../models/boardModel");
var _invitationModel = require("../models/invitationModel");
var _constants = require("../utils/constants");
var _formatter = require("../utils/formatter");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var createNewBoardInvitation = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(reqBody, inviterId) {
    var inviter, invitee, board, newInvitationData, createdInvitation, getInvitation, resInvitation;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return _userModel.userModel.findOneById(inviterId);
        case 3:
          inviter = _context.sent;
          _context.next = 6;
          return _userModel.userModel.findOneByEmail(reqBody.inviteeEmail);
        case 6:
          invitee = _context.sent;
          _context.next = 9;
          return _boardModel.boardModel.findOneById(reqBody.boardId);
        case 9:
          board = _context.sent;
          if (!(!invitee || !inviter || !board)) {
            _context.next = 12;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!');
        case 12:
          // Tạo data cần thiết để lưu vào trong DB
          // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status để test xem Model validate ok chưa.
          newInvitationData = {
            inviterId: inviterId,
            inviteeId: invitee._id.toString(),
            // chuyển từ ObjectId về String vì sang bên Model có check lại data ở hàm create
            type: _constants.INVITATION_TYPES.BOARD_INVITATION,
            boardInvitation: {
              boardId: board._id.toString(),
              status: _constants.BOARD_INVITATION_STATUS.PENDING
            }
          }; // Gọi sang Model để lưu vào DB
          _context.next = 15;
          return _invitationModel.invitationModel.createNewBoardInvitation(newInvitationData);
        case 15:
          createdInvitation = _context.sent;
          _context.next = 18;
          return _invitationModel.invitationModel.findOneById(createdInvitation.insertedId.toString());
        case 18:
          getInvitation = _context.sent;
          // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE thoải mái xử lý.
          resInvitation = _objectSpread(_objectSpread({}, getInvitation), {}, {
            board: board,
            inviter: (0, _formatter.pickUser)(inviter),
            invitee: (0, _formatter.pickUser)(invitee)
          });
          return _context.abrupt("return", resInvitation);
        case 23:
          _context.prev = 23;
          _context.t0 = _context["catch"](0);
          throw _context.t0;
        case 26:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 23]]);
  }));
  return function createNewBoardInvitation(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var getInvitations = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(userId) {
    var _getInvitations, resInvitations;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return _invitationModel.invitationModel.findByUser(userId);
        case 3:
          _getInvitations = _context2.sent;
          // console.log('service: ', getInvitations)
          // Vì các dữ liệu inviter, invitee và board là đang ở giá trị mảng 1 phần tử nếu lấy
          // ra được nên chúng ta biến đổi nó về Json Object trước khi trả về
          resInvitations = _getInvitations.map(function (inv) {
            return _objectSpread(_objectSpread({}, inv), {}, {
              inviter: inv.inviter[0] || {},
              invitee: inv.invitee[0] || {},
              board: inv.board[0] || {}
            });
          });
          return _context2.abrupt("return", resInvitations);
        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;
        case 11:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 8]]);
  }));
  return function getInvitations(_x3) {
    return _ref2.apply(this, arguments);
  };
}();
var updateBoardInvitation = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(userId, invitationId, status) {
    var getInvitation, boardId, getBoard, boardOwnerAndMemberIds, updateData, updatedInvitation;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return _invitationModel.invitationModel.findOneById(invitationId);
        case 3:
          getInvitation = _context3.sent;
          if (getInvitation) {
            _context3.next = 6;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Invitation not found!');
        case 6:
          // Sau khi có Invitation rồi thì lấy full thông tin của board
          boardId = getInvitation.boardInvitation.boardId;
          _context3.next = 9;
          return _boardModel.boardModel.findOneById(boardId);
        case 9:
          getBoard = _context3.sent;
          if (getBoard) {
            _context3.next = 12;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Board not found!');
        case 12:
          // Kiểm tra xem nếu status là ACCEPTED join board mà cái thằng user (invitee) đã
          // là owner hoặc member của board rồi thì trả về thông báo lỗi luôn.
          // Note: 2 mảng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId
          // nên cho nó về String hết luôn để check
          boardOwnerAndMemberIds = [].concat((0, _toConsumableArray2["default"])(getBoard.ownerIds), (0, _toConsumableArray2["default"])(getBoard.memberIds)).toString();
          if (!(status === _constants.BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId))) {
            _context3.next = 15;
            break;
          }
          throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_ACCEPTABLE, 'You already a member of this board!');
        case 15:
          // Tạo data để update bản ghi invitation
          updateData = {
            boardInvitation: _objectSpread(_objectSpread({}, getInvitation.boardInvitation), {}, {
              status: status //accepted or rejected
            })
          }; // Bước 1: Cập nhật status trong bản ghi Invitation
          _context3.next = 18;
          return _invitationModel.invitationModel.update(invitationId, updateData);
        case 18:
          updatedInvitation = _context3.sent;
          if (!(updatedInvitation.boardInvitation.status === _constants.BOARD_INVITATION_STATUS.ACCEPTED)) {
            _context3.next = 22;
            break;
          }
          _context3.next = 22;
          return _boardModel.boardModel.pushMemberIds(boardId, userId);
        case 22:
          return _context3.abrupt("return", updatedInvitation);
        case 25:
          _context3.prev = 25;
          _context3.t0 = _context3["catch"](0);
          throw _context3.t0;
        case 28:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 25]]);
  }));
  return function updateBoardInvitation(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var invitationService = {
  createNewBoardInvitation: createNewBoardInvitation,
  getInvitations: getInvitations,
  updateBoardInvitation: updateBoardInvitation
};
exports.invitationService = invitationService;