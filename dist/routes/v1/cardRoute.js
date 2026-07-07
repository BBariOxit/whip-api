"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cardRouter = void 0;
var _express = _interopRequireDefault(require("express"));
var _cardController = require("../../controllers/cardController");
var _cardValidation = require("../../validations/cardValidation");
var _authMiddleware = require("../../middlewares/authMiddleware");
var _multerUploadMiddleware = require("../../middlewares/multerUploadMiddleware");
var _rbacMiddleware = require("../../middlewares/rbacMiddleware");
var Router = _express["default"].Router();
Router.route('/').post(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardValidation.cardValidation.createNew, _cardController.cardController.createNew);

// Template routes (phải khai báo trước /:id để tránh conflict)
Router.route('/use-template').post(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardController.cardController.useTemplate);

// Duplicate/paste card: liên quan card nguồn + column đích (có thể khác board) nên quyền được kiểm
// trong service (ghi vào board đích cần member/admin, copy từ board khác cần quyền xem board nguồn)
Router.route('/duplicate').post(_authMiddleware.authMiddleware.isAuthorized, _cardValidation.cardValidation.duplicate, _cardController.cardController.duplicateCard);
Router.route('/templates/:id')["delete"](_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardController.cardController.deleteTemplate);
Router.route('/:id').put(_authMiddleware.authMiddleware.isAuthorized, _multerUploadMiddleware.multerUploadMiddleware.upload.single('cardCover'), (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardValidation.cardValidation.update, _cardController.cardController.update)["delete"](_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardController.cardController.deleteItem);

// Archive Card API
Router.route('/:id/archive').put(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardController.cardController.archiveCard);
Router.route('/:id/restore').put(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardController.cardController.restoreCard);

// Save as Template
Router.route('/:id/save-as-template').post(_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardController.cardController.saveAsTemplate);

// Attachment APIs: Upload và Xóa file đính kèm
Router.route('/:id/attachments').post(_authMiddleware.authMiddleware.isAuthorized, _multerUploadMiddleware.multerUploadMiddleware.uploadAttachment.single('attachmentFile'), (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardController.cardController.uploadAttachment)["delete"](_authMiddleware.authMiddleware.isAuthorized, (0, _rbacMiddleware.requireBoardRole)(['admin', 'member']), _cardController.cardController.deleteAttachment);
var cardRouter = Router;
exports.cardRouter = cardRouter;