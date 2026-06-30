"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PASSWORD_RULE_MESSAGE = exports.PASSWORD_RULE = exports.PASSWORD_CONFIRMATION_MESSAGE = exports.OBJECT_ID_RULE_MESSAGE = exports.OBJECT_ID_RULE = exports.LIMIT_COMMON_FILE_SIZE = exports.FIELD_REQUIRED_MESSAGE = exports.EMAIL_RULE_MESSAGE = exports.EMAIL_RULE = exports.ALLOW_COMMON_FILE_TYPES = exports.ALLOW_ATTACHMENT_FILE_TYPES = void 0;
var OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
exports.OBJECT_ID_RULE = OBJECT_ID_RULE;
var OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!';
exports.OBJECT_ID_RULE_MESSAGE = OBJECT_ID_RULE_MESSAGE;
var FIELD_REQUIRED_MESSAGE = 'This field is required.';
exports.FIELD_REQUIRED_MESSAGE = FIELD_REQUIRED_MESSAGE;
var EMAIL_RULE = /^\S+@\S+\.\S+$/;
exports.EMAIL_RULE = EMAIL_RULE;
var EMAIL_RULE_MESSAGE = 'Email is invalid. (phanbao@gmail.com)';
exports.EMAIL_RULE_MESSAGE = EMAIL_RULE_MESSAGE;
var PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/;
exports.PASSWORD_RULE = PASSWORD_RULE;
var PASSWORD_RULE_MESSAGE = 'Password must include at least 1 letter, a number, and at least 8 characters.';
exports.PASSWORD_RULE_MESSAGE = PASSWORD_RULE_MESSAGE;
var PASSWORD_CONFIRMATION_MESSAGE = 'Password Confirmation does not match!';
exports.PASSWORD_CONFIRMATION_MESSAGE = PASSWORD_CONFIRMATION_MESSAGE;
var LIMIT_COMMON_FILE_SIZE = 10485760; // byte = 10 MB
exports.LIMIT_COMMON_FILE_SIZE = LIMIT_COMMON_FILE_SIZE;
var ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png'];

// Attachment cho phép nhiều loại file hơn
exports.ALLOW_COMMON_FILE_TYPES = ALLOW_COMMON_FILE_TYPES;
var ALLOW_ATTACHMENT_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/x-rar-compressed', 'text/plain'];
exports.ALLOW_ATTACHMENT_FILE_TYPES = ALLOW_ATTACHMENT_FILE_TYPES;