import multer from 'multer'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES, ALLOW_ATTACHMENT_FILE_TYPES } from '../utils/validators'
import ApiError from '../utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Function Kiểm tra loại file nào được chấp nhận (chỉ ảnh - dùng cho cover)
const customFileFilter = (req, file, callback) => {
  // console.log('file: ', file)
  // đối với thằng multer, kiểm tra kiểu file thì sử dụng mimetype 
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  // nếu như kiểu file là hợp lệ
  return callback(null, true)
}

// Function Kiểm tra loại file cho attachment (cho phép nhiều định dạng hơn)
const attachmentFileFilter = (req, file, callback) => {
  if (!ALLOW_ATTACHMENT_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Accepted: images, pdf, doc, excel, zip, txt'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  return callback(null, true)
}

// khởi tạo func upload được bọc bởi multer (chỉ ảnh - dùng cho cover)
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

// khởi tạo func upload cho attachment (nhiều loại file hơn)
const uploadAttachment = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: attachmentFileFilter
})

export const multerUploadMiddleware = { upload, uploadAttachment }