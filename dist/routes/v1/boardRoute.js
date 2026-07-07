"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boardRouter = void 0;
var _express = _interopRequireDefault(require("express"));
var _boardController = require("../../controllers/boardController");
var _authMiddleware = require("../../middlewares/authMiddleware");
var _boardValidation = require("../../validations/boardValidation");
var _rbacMiddleware = require("../../middlewares/rbacMiddleware");
var Router = _express["default"].Router();
Router.route('/').get(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.getBoards).post(_authMiddleware.authMiddleware.isAuthorized, _boardValidation.boardValidation.createNew, _boardController.boardController.createNew);
Router.route('/templates').get(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.getTemplates);

// Clone 1 board template thành board mới của chính user (personal + user làm owner).
// Chỉ cần đăng nhập: board mới luôn thuộc về người gọi, và service chặn clone thứ không phải template.
Router.route('/templates/clone').post(_authMiddleware.authMiddleware.isAuthorized, _boardValidation.boardValidation.cloneTemplate, _boardController.boardController.cloneTemplate);
Router.route('/bulk-delete')["delete"](_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.bulkDeleteItems);

// Lưu ý: phải khai báo TRƯỚC route '/:id' để Express không match '/starred' thành param :id
Router.route('/starred').get(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.getStarredBoards);
Router.route('/:id/archived-items').get(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _boardController.boardController.getArchivedItems);
Router.route('/:id/card-templates').get(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _boardController.boardController.getCardTemplates);
Router.route('/:id/column-templates').get(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _boardController.boardController.getColumnTemplates);
Router.route('/:id').get(_authMiddleware.authMiddleware.optionalAuth, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member', 'viewer']), _boardController.boardController.getDetails).put(_authMiddleware.authMiddleware.isAuthorized, _rbacMiddleware.requireBoardAdmin, _boardValidation.boardValidation.update, _boardController.boardController.update)["delete"](_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _boardController.boardController.deleteItem);
Router.route('/:id/visibility').put(_authMiddleware.authMiddleware.isAuthorized, _rbacMiddleware.requireBoardAdmin, _boardController.boardController.updateVisibility);

// Gắn/gỡ sao board (toggle). Chỉ cần đăng nhập; phân quyền xem board được check ở tầng service.
Router.route('/:id/star').put(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.toggleStarred);
Router.route('/:id/join').post(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.joinBoard);

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong 1 board.
// Quyền + kiểm tra card/2 column cùng board được xử lý trong service (boardId suy từ card, không nhận từ client).
Router.route('/supports/moving_card').put(_authMiddleware.authMiddleware.isAuthorized, _boardValidation.boardValidation.moveCardifferentColumn, _boardController.boardController.moveCardifferentColumn);
Router.route('/:id/leave').post(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.leaveBoard);
var boardRouter = Router;
exports.boardRouter = boardRouter;