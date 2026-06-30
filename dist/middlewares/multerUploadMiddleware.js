"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.multerUploadMiddleware = void 0;
var _multer = _interopRequireDefault(require("multer"));
var _validators = require("../utils/validators");
var _ApiError = _interopRequireDefault(require("../utils/ApiError"));
var _httpStatusCodes = require("http-status-codes");
// Function Kiểm tra loại file nào được chấp nhận (chỉ ảnh - dùng cho cover)
var customFileFilter = function customFileFilter(req, file, callback) {
  // console.log('file: ', file)
  // đối với thằng multer, kiểm tra kiểu file thì sử dụng mimetype 
  if (!_validators.ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    var errMessage = 'File type is invalid. Only accept jpg, jpeg and png';
    return callback(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null);
  }
  // nếu như kiểu file là hợp lệ
  return callback(null, true);
};

// Function Kiểm tra loại file cho attachment (cho phép nhiều định dạng hơn)
var attachmentFileFilter = function attachmentFileFilter(req, file, callback) {
  if (!_validators.ALLOW_ATTACHMENT_FILE_TYPES.includes(file.mimetype)) {
    var errMessage = 'File type is invalid. Accepted: images, pdf, doc, excel, zip, txt';
    return callback(new _ApiError["default"](_httpStatusCodes.StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null);
  }
  return callback(null, true);
};

// khởi tạo func upload được bọc bởi multer (chỉ ảnh - dùng cho cover)
var upload = (0, _multer["default"])({
  limits: {
    fileSize: _validators.LIMIT_COMMON_FILE_SIZE
  },
  fileFilter: customFileFilter
});

// khởi tạo func upload cho attachment (nhiều loại file hơn)
var uploadAttachment = (0, _multer["default"])({
  limits: {
    fileSize: _validators.LIMIT_COMMON_FILE_SIZE
  },
  fileFilter: attachmentFileFilter
});
var multerUploadMiddleware = {
  upload: upload,
  uploadAttachment: uploadAttachment
};
exports.multerUploadMiddleware = multerUploadMiddleware;