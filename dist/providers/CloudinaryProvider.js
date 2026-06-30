"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cloudinaryProvider = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _cloudinary = _interopRequireDefault(require("cloudinary"));
var _streamifier = _interopRequireDefault(require("streamifier"));
var _environment = require("../config/environment");
// Cấu hình cloudinary , sử dụng v2
var cloudinaryV2 = _cloudinary["default"].v2;
cloudinaryV2.config({
  cloud_name: _environment.env.CLOUDINARY_CLOUD_NAME,
  api_key: _environment.env.CLOUDINARY_API_KEY,
  api_secret: _environment.env.CLOUDINARY_API_SECRET
});

// khởi tạo function upload file lên cloudinary
// resource_type: 'auto' để Cloudinary tự nhận diện file là ảnh hay raw file (pdf, doc...)
var streamUpload = function streamUpload(fileBuffer, folderName) {
  var resourceType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'auto';
  return new Promise(function (resolve, reject) {
    // tạo file writable stream để ghi dữ liệu lên cloudinary
    var stream = cloudinaryV2.uploader.upload_stream({
      folder: folderName,
      resource_type: resourceType
    }, function (err, result) {
      if (err) reject(err);else resolve(result);
    });
    // thực hiện upload cái luồng trên bằng lib streamifier
    _streamifier["default"].createReadStream(fileBuffer).pipe(stream);
  });
};

// Xóa file trên Cloudinary bằng publicId — tránh để rác đầy Cloudinary
var deleteResource = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(publicId) {
    var result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return cloudinaryV2.uploader.destroy(publicId);
        case 3:
          result = _context.sent;
          if (!(result.result === 'not found')) {
            _context.next = 8;
            break;
          }
          _context.next = 7;
          return cloudinaryV2.uploader.destroy(publicId, {
            resource_type: 'raw'
          });
        case 7:
          return _context.abrupt("return", _context.sent);
        case 8:
          return _context.abrupt("return", result);
        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          throw new Error(_context.t0);
        case 14:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 11]]);
  }));
  return function deleteResource(_x) {
    return _ref.apply(this, arguments);
  };
}();
var cloudinaryProvider = {
  streamUpload: streamUpload,
  deleteResource: deleteResource
};
exports.cloudinaryProvider = cloudinaryProvider;