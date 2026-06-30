"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userRoute = void 0;
var _express = _interopRequireDefault(require("express"));
var _userValidation = require("../../validations/userValidation");
var _userController = require("../../controllers/userController");
var _authMiddleware = require("../../middlewares/authMiddleware");
var _multerUploadMiddleware = require("../../middlewares/multerUploadMiddleware");
var Router = _express["default"].Router();
Router.route('/register').post(_userValidation.userValidation.createNew, _userController.userController.createNew);
Router.route('/verify').put(_userValidation.userValidation.verifyAccount, _userController.userController.verifyAccount);
Router.route('/login').post(_userValidation.userValidation.login, _userController.userController.login);
Router.route('/google-login').post(_userController.userController.googleLogin);
Router.route('/github-login').post(_userController.userController.githubLogin);
Router.route('/logout')["delete"](_userController.userController.logout);
Router.route('/refresh_token').get(_userController.userController.refreshToken);
Router.route('/update').put(_authMiddleware.authMiddleware.isAuthorized, _multerUploadMiddleware.multerUploadMiddleware.upload.single('avatar'), _userValidation.userValidation.update, _userController.userController.update);
var userRoute = Router;
exports.userRoute = userRoute;