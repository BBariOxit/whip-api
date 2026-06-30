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
var Router = _express["default"].Router();
Router.route('/').get(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.getBoards).post(_authMiddleware.authMiddleware.isAuthorized, _boardValidation.boardValidation.createNew, _boardController.boardController.createNew);
Router.route('/templates').get(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.getTemplates);
Router.route('/templates/clone').post(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.cloneTemplate);
Router.route('/bulk-delete')["delete"](_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.bulkDeleteItems);
Router.route('/:id/archived-items').get(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.getArchivedItems);
Router.route('/:id/card-templates').get(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.getCardTemplates);
Router.route('/:id/column-templates').get(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.getColumnTemplates);
Router.route('/:id').get(_authMiddleware.authMiddleware.optionalAuth, _boardController.boardController.getDetails).put(_authMiddleware.authMiddleware.isAuthorized, _boardValidation.boardValidation.update, _boardController.boardController.update)["delete"](_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.deleteItem);
Router.route('/:id/visibility').put(_authMiddleware.authMiddleware.isAuthorized, _boardController.boardController.updateVisibility);

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong 1 board
Router.route('/supports/moving_card').put(_authMiddleware.authMiddleware.isAuthorized, _boardValidation.boardValidation.moveCardifferentColumn, _boardController.boardController.moveCardifferentColumn);
var boardRouter = Router;
exports.boardRouter = boardRouter;