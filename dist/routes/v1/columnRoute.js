"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.columnRouter = void 0;
var _express = _interopRequireDefault(require("express"));
var _columnController = require("../../controllers/columnController");
var _columnValidation = require("../../validations/columnValidation");
var _authMiddleware = require("../../middlewares/authMiddleware");
var Router = _express["default"].Router();
Router.route('/').post(_authMiddleware.authMiddleware.isAuthorized, _columnValidation.columnValidation.createNew, _columnController.columnController.createNew);
Router.route('/:id').put(_authMiddleware.authMiddleware.isAuthorized, _columnValidation.columnValidation.update, _columnController.columnController.update)["delete"](_authMiddleware.authMiddleware.isAuthorized, _columnValidation.columnValidation.deleteItem, _columnController.columnController.deleteItem);
Router.route('/clear-cards/:id')["delete"](_authMiddleware.authMiddleware.isAuthorized, _columnController.columnController.clearAllCards);
Router.route('/:id/cards-layout').put(_authMiddleware.authMiddleware.isAuthorized, _columnController.columnController.updateAllCardsLayout);

// Archive Column API
Router.route('/:id/archive').put(_authMiddleware.authMiddleware.isAuthorized, _columnController.columnController.archiveColumn);
Router.route('/:id/restore').put(_authMiddleware.authMiddleware.isAuthorized, _columnController.columnController.restoreColumn);

// Template APIs
Router.route('/:id/save-as-template').post(_authMiddleware.authMiddleware.isAuthorized, _columnController.columnController.saveAsTemplate);
Router.route('/use-template').post(_authMiddleware.authMiddleware.isAuthorized, _columnController.columnController.useColumnTemplate);
Router.route('/templates/:id')["delete"](_authMiddleware.authMiddleware.isAuthorized, _columnController.columnController.deleteColumnTemplate);
Router.route('/duplicate').post(_authMiddleware.authMiddleware.isAuthorized, _columnController.columnController.duplicateColumn);
var columnRouter = Router;
exports.columnRouter = columnRouter;