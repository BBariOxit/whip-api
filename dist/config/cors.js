"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.corsOptions = void 0;
var _constants = require("../utils/constants");
var _environment = require("./environment");
var _httpStatusCodes = require("http-status-codes");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
// Cấu hình CORS Option
var corsOptions = {
  origin: function origin(_origin, callback) {
    // nếu môi trường là local dev thì cho qua luôn
    if (!_origin || _environment.env.BUILD_MODE === 'dev') {
      return callback(null, true);
    }
    // với production
    // env.BUILD_MODE === 'production'

    // Kiểm tra xem origin có phải là domain được chấp nhận hay không
    if (_constants.WHITELIST_DOMAINS.includes(_origin)) {
      return callback(null, true);
    }

    // Cứ thằng nào có đuôi .vercel.app là cho qua hết
    if (_origin && /\.vercel\.app$/.test(_origin)) {
      return callback(null, true);
    }

    // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
    return callback(new _ApiError["default"](_httpStatusCodes.StatusCodes.FORBIDDEN, "".concat(_origin, " not allowed by our CORS Policy.")));
  },
  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,
  // CORS sẽ cho phép nhận cookies từ request
  credentials: true
};
exports.corsOptions = corsOptions;