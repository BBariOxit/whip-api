"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.slugify = exports.pickUser = void 0;
var _lodash = require("lodash");
// Simple method to Convert a String to Slug
var slugify = function slugify(val) {
  if (!val) return '';
  return String(val).normalize('NFKD') // split accented characters into their base characters and diacritical marks
  .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
  .trim() // trim leading or trailing whitespace
  .toLowerCase() // convert to lowercase
  .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
  .replace(/\s+/g, '-') // replace spaces with hyphens
  .replace(/-+/g, '-'); // remove consecutive hyphens
};

// Lấy một vài dữ liệu cụ thể trong User để tránh việc trả về các dữ liệu nhạy cảm như hash password
exports.slugify = slugify;
var pickUser = function pickUser(user) {
  if (!user) return {};
  return (0, _lodash.pick)(user, ['_id', 'email', 'username', 'displayName', 'avatar', 'role', 'isActive', 'createdAt', 'updatedAt']);
};
exports.pickUser = pickUser;