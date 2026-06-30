"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.brevoProvider = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _environment = require("../config/environment");
var sendEmail = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(recipientEmail, subject, htmlContent) {
    var response, data;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': _environment.env.BREVO_API_KEY,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              sender: {
                name: _environment.env.ADMIN_EMAIL_NAME,
                email: _environment.env.ADMIN_EMAIL_ADDRESS
              },
              to: [{
                email: recipientEmail
              }],
              subject: subject,
              htmlContent: htmlContent
            })
          });
        case 2:
          response = _context.sent;
          _context.next = 5;
          return response.json();
        case 5:
          data = _context.sent;
          if (response.ok) {
            _context.next = 9;
            break;
          }
          console.error('Lỗi từ Brevo:', data);
          throw new Error(data.message || 'Lỗi khi gửi email qua Brevo');
        case 9:
          console.log('Đã gửi email thành công, ID:', data.messageId);
          return _context.abrupt("return", data);
        case 11:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function sendEmail(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var brevoProvider = {
  sendEmail: sendEmail
};
exports.brevoProvider = brevoProvider;