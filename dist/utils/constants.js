"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_ROLES = exports.WHITELIST_DOMAINS = exports.WEBSITE_DOMAIN = exports.SOCKET_EVENTS = exports.NOTIFICATION_TYPES = exports.NOTIFICATION_TTL_DAYS = exports.NOTIFICATION_CONFIG = exports.INVITATION_TYPES = exports.DEFAULT_PAGE = exports.DEFAULT_ITEMS_PER_PAGE = exports.CARD_MEMBER_ACTIONS = exports.BOARD_TYPES = exports.BOARD_INVITATION_STATUS = exports.ACTIVITY_ACTION_TYPES = void 0;
var _environment = require("../config/environment");
// những cái domain được phép truy cập tới tài nguyên server
var WHITELIST_DOMAINS = [
// ko cần localhost nữa vì file cors luôn luôn cho phép mt dev
// 'http://localhost:5173'
// khi deploy lên domain chính thức
'https://whip-app-ebon.vercel.app', 'https://whip.cobweb.id.vn', 'https://whip.id.vn'];
exports.WHITELIST_DOMAINS = WHITELIST_DOMAINS;
var WORKSPACE_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
};
exports.WORKSPACE_ROLES = WORKSPACE_ROLES;
var BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  WORKSPACE_VISIBLE: 'workspace_visible'
};
exports.BOARD_TYPES = BOARD_TYPES;
var WEBSITE_DOMAIN = _environment.env.BUILD_MODE === 'dev' ? _environment.env.WEBSITE_DOMAIN_DEVELOPMENT : _environment.env.WEBSITE_DOMAIN_PRODUCTION;
exports.WEBSITE_DOMAIN = WEBSITE_DOMAIN;
var DEFAULT_PAGE = 1;
exports.DEFAULT_PAGE = DEFAULT_PAGE;
var DEFAULT_ITEMS_PER_PAGE = 10;
exports.DEFAULT_ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE;
var INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION',
  WORKSPACE_INVITATION: 'WORKSPACE_INVITATION'
};
exports.INVITATION_TYPES = INVITATION_TYPES;
var BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};
exports.BOARD_INVITATION_STATUS = BOARD_INVITATION_STATUS;
var CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
};

// Các loại notification (thông báo chung, khác với invitations)
exports.CARD_MEMBER_ACTIONS = CARD_MEMBER_ACTIONS;
var NOTIFICATION_TYPES = {
  MEMBER_JOINED: 'MEMBER_JOINED',
  BOARD_CREATED: 'BOARD_CREATED',
  BOARD_DELETED: 'BOARD_DELETED',
  BOARD_ACTIVITY: 'BOARD_ACTIVITY',
  MENTION: 'MENTION'
};

// Cấu hình cho từng loại: gắn với toggle nào trong workspace member.notificationPrefs,
// và gửi qua kênh nào ('email' | 'inApp'). Đây là "bảng đấu dây" trung tâm.
exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
var NOTIFICATION_CONFIG = {
  MEMBER_JOINED: {
    toggleKey: 'memberJoins',
    channel: 'email'
  },
  BOARD_CREATED: {
    toggleKey: 'boardChanges',
    channel: 'inApp'
  },
  BOARD_DELETED: {
    toggleKey: 'boardChanges',
    channel: 'inApp'
  },
  BOARD_ACTIVITY: {
    toggleKey: 'boardActivity',
    channel: 'inApp'
  },
  MENTION: {
    toggleKey: 'mentions',
    channel: 'inApp'
  }
};

// Tên socket event realtime cho notification chung
exports.NOTIFICATION_CONFIG = NOTIFICATION_CONFIG;
var SOCKET_EVENTS = {
  NEW_NOTIFICATION: 'BE_NEW_NOTIFICATION'
};

// Số ngày giữ notification in-app trước khi TTL index của Mongo tự xoá
exports.SOCKET_EVENTS = SOCKET_EVENTS;
var NOTIFICATION_TTL_DAYS = 60;
exports.NOTIFICATION_TTL_DAYS = NOTIFICATION_TTL_DAYS;
var ACTIVITY_ACTION_TYPES = {
  UPDATE_DATE: 'UPDATE_DATE',
  SET_DATE: 'SET_DATE',
  ADD_LABEL: 'ADD_LABEL',
  REMOVE_LABEL: 'REMOVE_LABEL',
  ADD_MEMBER: 'ADD_MEMBER',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  UPDATE_COVER: 'UPDATE_COVER',
  ADD_ATTACHMENT: 'ADD_ATTACHMENT',
  REMOVE_ATTACHMENT: 'REMOVE_ATTACHMENT',
  ARCHIVE_CARD: 'ARCHIVE_CARD'
};
exports.ACTIVITY_ACTION_TYPES = ACTIVITY_ACTION_TYPES;