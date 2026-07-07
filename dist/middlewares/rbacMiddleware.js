"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requireWorkspaceRole = exports.requireBoardRole = exports.requireBoardAdmin = exports.getBoardAccessRole = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _workspaceModel = require("../models/workspaceModel");
var _boardModel = require("../models/boardModel");
var _columnModel = require("../models/columnModel");
var _cardModel = require("../models/cardModel");
var _labelModel = require("../models/labelModel");
var _commentModel = require("../models/commentModel");
var _constants = require("../utils/constants");
/**
 * Dynamic RBAC Middleware cho Workspace
 * Nhận vào mảng các Role được phép truy cập
 * 
 * Cách dùng trong route:
 *   requireWorkspaceRole(['owner', 'admin']) — chỉ Owner và Admin mới qua
 *   requireWorkspaceRole(['owner', 'admin', 'member']) — tất cả member
 * 
 * Sau khi pass:
 *   req.workspace = workspace document
 *   req.workspaceMemberRole = role string ('owner' | 'admin' | 'member')
 */
var requireWorkspaceRole = function requireWorkspaceRole() {
  var allowedRoles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
      var _req$jwtDecoded, userId, workspaceId, workspace, memberInfo;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            userId = (_req$jwtDecoded = req.jwtDecoded) === null || _req$jwtDecoded === void 0 ? void 0 : _req$jwtDecoded._id;
            if (userId) {
              _context.next = 4;
              break;
            }
            return _context.abrupt("return", next(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNAUTHORIZED, 'Unauthorized! Please login.')));
          case 4:
            // Lấy workspaceId từ route param (:id) hoặc body
            workspaceId = req.params.id || req.body.workspaceId;
            if (workspaceId) {
              _context.next = 7;
              break;
            }
            return _context.abrupt("return", next(new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Workspace ID is required.')));
          case 7:
            _context.next = 9;
            return _workspaceModel.workspaceModel.findByMemberWithRole(workspaceId, userId, allowedRoles);
          case 9:
            workspace = _context.sent;
            if (workspace) {
              _context.next = 12;
              break;
            }
            return _context.abrupt("return", next(new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, 'Access denied. You do not have permission to perform this action on this workspace.')));
          case 12:
            // Tìm role cụ thể của user trong workspace để controller dùng
            memberInfo = workspace.members.find(function (m) {
              return m.userId.toString() === userId.toString();
            }); // Gắn thông tin vào request object cho các tầng phía sau sử dụng
            req.workspace = workspace;
            req.workspaceMemberRole = (memberInfo === null || memberInfo === void 0 ? void 0 : memberInfo.role) || null;
            next();
            _context.next = 21;
            break;
          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](0);
            next(new _ApiError["default"](_httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR, _context.t0.message));
          case 21:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 18]]);
    }));
    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
};
exports.requireWorkspaceRole = requireWorkspaceRole;
/**
 * Hàm Helper: Xác định Role của User đối với một Board cụ thể.
 * Trả về một trong các string: 'admin', 'member', 'viewer', 'none'
 */
var getBoardAccessRole = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(board, userId) {
    var _board$ownerIds, _board$memberIds;
    var isOwner, isMember, workspace, _workspace$members, memberInfo;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          // 1. Kiểm tra trực tiếp trên Board (người tạo hoặc thành viên đích danh)
          isOwner = (_board$ownerIds = board.ownerIds) === null || _board$ownerIds === void 0 ? void 0 : _board$ownerIds.some(function (id) {
            return id.toString() === userId.toString();
          });
          if (!isOwner) {
            _context2.next = 3;
            break;
          }
          return _context2.abrupt("return", 'admin');
        case 3:
          isMember = (_board$memberIds = board.memberIds) === null || _board$memberIds === void 0 ? void 0 : _board$memberIds.some(function (id) {
            return id.toString() === userId.toString();
          }); // 2. Nếu Board thuộc về một Workspace, kiểm tra quyền kế thừa
          if (!board.workspaceId) {
            _context2.next = 16;
            break;
          }
          _context2.next = 7;
          return _workspaceModel.workspaceModel.findById(board.workspaceId.toString());
        case 7:
          workspace = _context2.sent;
          if (!workspace) {
            _context2.next = 16;
            break;
          }
          memberInfo = (_workspace$members = workspace.members) === null || _workspace$members === void 0 ? void 0 : _workspace$members.find(function (m) {
            return m.userId.toString() === userId.toString();
          });
          if (!memberInfo) {
            _context2.next = 16;
            break;
          }
          if (!(memberInfo.role === _constants.WORKSPACE_ROLES.OWNER || memberInfo.role === _constants.WORKSPACE_ROLES.ADMIN)) {
            _context2.next = 13;
            break;
          }
          return _context2.abrupt("return", 'admin');
        case 13:
          if (!(memberInfo.role === _constants.WORKSPACE_ROLES.MEMBER)) {
            _context2.next = 16;
            break;
          }
          if (!(board.type === _constants.BOARD_TYPES.WORKSPACE_VISIBLE || isMember)) {
            _context2.next = 16;
            break;
          }
          return _context2.abrupt("return", 'member');
        case 16:
          if (!isMember) {
            _context2.next = 18;
            break;
          }
          return _context2.abrupt("return", 'member');
        case 18:
          if (!(board.type === _constants.BOARD_TYPES.PUBLIC)) {
            _context2.next = 20;
            break;
          }
          return _context2.abrupt("return", 'viewer');
        case 20:
          return _context2.abrupt("return", 'none');
        case 21:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function getBoardAccessRole(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Dynamic RBAC Middleware cho Board, Column, Card
 * Tự động moi boardId dựa theo URL và tính toán Role
 */
exports.getBoardAccessRole = getBoardAccessRole;
var requireBoardRole = function requireBoardRole() {
  var allowedRoles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return /*#__PURE__*/function () {
    var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
      var _req$jwtDecoded2, userId, boardId, board, cardId, commentId, comment, card, column, label, _card, userRole;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            // Đối với public board, viewer có thể không cần login, NHƯNG các thao tác sửa thì cần login.
            // Do đó nếu allowedRoles chỉ yêu cầu 'viewer' và không có userId, ta có thể du di hoặc bắt buộc.
            // Tốt nhất là requireAuth ở route, nếu route cho phép optional auth (như GET /boards/:id) thì userId có thể undefined.
            userId = (_req$jwtDecoded2 = req.jwtDecoded) === null || _req$jwtDecoded2 === void 0 ? void 0 : _req$jwtDecoded2._id; // boardId có thể đến trực tiếp từ body/query, hoặc từ route param :boardId (vd custom-fields)
            boardId = req.body.boardId || req.query.boardId || req.params.boardId;
            board = null; // Nếu chưa xác định được boardId, suy ra từ resource đang thao tác tùy nhóm route
            if (boardId) {
              _context3.next = 55;
              break;
            }
            if (!(req.baseUrl.includes('/comments') || req.baseUrl.includes('/activities'))) {
              _context3.next = 25;
              break;
            }
            // Comment/activity gắn với 1 card -> boardId suy ra từ card.
            // cardId nằm ở body/query (create/list) hoặc suy ngược từ chính comment (update/delete/replies).
            cardId = req.body.cardId || req.query.cardId;
            if (!(!cardId && req.baseUrl.includes('/comments'))) {
              _context3.next = 16;
              break;
            }
            commentId = req.params.id || req.params.parentId;
            if (!commentId) {
              _context3.next = 16;
              break;
            }
            _context3.next = 12;
            return _commentModel.commentModel.findOneById(commentId);
          case 12:
            comment = _context3.sent;
            if (comment) {
              _context3.next = 15;
              break;
            }
            throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Comment not found!');
          case 15:
            cardId = comment.cardId.toString();
          case 16:
            if (!cardId) {
              _context3.next = 23;
              break;
            }
            _context3.next = 19;
            return _cardModel.cardModel.findOneById(cardId);
          case 19:
            card = _context3.sent;
            if (card) {
              _context3.next = 22;
              break;
            }
            throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Card not found!');
          case 22:
            boardId = card.boardId.toString();
          case 23:
            _context3.next = 55;
            break;
          case 25:
            if (!req.params.id) {
              _context3.next = 55;
              break;
            }
            if (!req.baseUrl.includes('/boards')) {
              _context3.next = 30;
              break;
            }
            boardId = req.params.id;
            _context3.next = 55;
            break;
          case 30:
            if (!req.baseUrl.includes('/columns')) {
              _context3.next = 39;
              break;
            }
            _context3.next = 33;
            return _columnModel.columnModel.findOneById(req.params.id);
          case 33:
            column = _context3.sent;
            if (column) {
              _context3.next = 36;
              break;
            }
            throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Column not found!');
          case 36:
            boardId = column.boardId.toString();
            _context3.next = 55;
            break;
          case 39:
            if (!req.baseUrl.includes('/labels')) {
              _context3.next = 48;
              break;
            }
            _context3.next = 42;
            return _labelModel.labelModel.findOneById(req.params.id);
          case 42:
            label = _context3.sent;
            if (label) {
              _context3.next = 45;
              break;
            }
            throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Label not found!');
          case 45:
            boardId = label.boardId.toString();
            _context3.next = 55;
            break;
          case 48:
            if (!req.baseUrl.includes('/cards')) {
              _context3.next = 55;
              break;
            }
            _context3.next = 51;
            return _cardModel.cardModel.findOneById(req.params.id);
          case 51:
            _card = _context3.sent;
            if (_card) {
              _context3.next = 54;
              break;
            }
            throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Card not found!');
          case 54:
            boardId = _card.boardId.toString();
          case 55:
            if (boardId) {
              _context3.next = 57;
              break;
            }
            throw new _ApiError["default"](_httpStatusCodes.StatusCodes.BAD_REQUEST, 'Board ID could not be determined for access check.');
          case 57:
            _context3.next = 59;
            return _boardModel.boardModel.findOneById(boardId);
          case 59:
            board = _context3.sent;
            if (board) {
              _context3.next = 62;
              break;
            }
            throw new _ApiError["default"](_httpStatusCodes.StatusCodes.NOT_FOUND, 'Board not found!');
          case 62:
            // Tính toán role
            userRole = 'none';
            if (!userId) {
              _context3.next = 69;
              break;
            }
            _context3.next = 66;
            return getBoardAccessRole(board, userId);
          case 66:
            userRole = _context3.sent;
            _context3.next = 70;
            break;
          case 69:
            if (board.type === _constants.BOARD_TYPES.PUBLIC) {
              // Nếu không login mà board public thì vẫn được quyền viewer
              userRole = 'viewer';
            }
          case 70:
            if (allowedRoles.includes(userRole)) {
              _context3.next = 72;
              break;
            }
            throw new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, "Access denied. You need one of these roles: [".concat(allowedRoles.join(', '), "] but you are '").concat(userRole, "'."));
          case 72:
            // Đính kèm board vào req để controller xài nếu cần (đỡ phải query lại)
            req.board = board;
            req.boardAccessRole = userRole;
            next();
            _context3.next = 80;
            break;
          case 77:
            _context3.prev = 77;
            _context3.t0 = _context3["catch"](0);
            next(new _ApiError["default"](_context3.t0.statusCode || _httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR, _context3.t0.message));
          case 80:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[0, 77]]);
    }));
    return function (_x6, _x7, _x8) {
      return _ref3.apply(this, arguments);
    };
  }();
};

/**
 * Hàm bọc lại requireBoardAdmin cũ để không vỡ logic ở những chỗ đang xài
 */
exports.requireBoardRole = requireBoardRole;
var requireBoardAdmin = requireBoardRole(['admin']);
exports.requireBoardAdmin = requireBoardAdmin;