import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

// Cấu hình cloudinary , sử dụng v2
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// khởi tạo function upload file lên cloudinary
// resource_type: 'auto' để Cloudinary tự nhận diện file là ảnh hay raw file (pdf, doc...)
const streamUpload = (fileBuffer, folderName, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    // tạo file writable stream để ghi dữ liệu lên cloudinary
    const stream = cloudinaryV2.uploader.upload_stream(
      { folder: folderName, resource_type: resourceType },
      (err, result) => {
        if (err) reject(err)
        else resolve(result)
      }
    )
    // thực hiện upload cái luồng trên bằng lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

// Xóa file trên Cloudinary bằng publicId — tránh để rác đầy Cloudinary
const deleteResource = async (publicId) => {
  try {
    // Thử xóa dạng image trước
    const result = await cloudinaryV2.uploader.destroy(publicId)
    // Nếu Cloudinary trả về "not found" thì thử xóa dạng raw (pdf, doc, zip...)
    if (result.result === 'not found') {
      return await cloudinaryV2.uploader.destroy(publicId, { resource_type: 'raw' })
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const cloudinaryProvider = {
  streamUpload,
  deleteResource
}