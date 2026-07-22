import { StatusCodes } from 'http-status-codes'
import { jwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { authToken } from '~/utils/authToken'

// Middleware này sẽ đảm nhận việc quan trọng:
// Xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phía client - withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken

  // nếu như cái access Token không tồn tại thì trả về lỗi luôn
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {
    // Bước 01: Thực hiện giải mã token xem nó có hợp lệ hay là không
    const accessTokenDecoded = await jwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    const authenticatedUser = await authToken.resolveUser(accessTokenDecoded)
    if (!authenticatedUser) throw new Error('session revoked')
    // console.log('accessTokenDecoded', accessTokenDecoded)
    // Bước 02: Quan trọng: Nếu như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được vào cái req.jwtDecoded, để sử dụng cho các tầng cần xử lý ở phía sau
    req.jwtDecoded = authenticatedUser

    // Bước 03: Cho phép cái request đi tiếp
    next()

  } catch (error) {
    // Nếu cái accessToken nó bị hết hạn (expired) thì mình cần trả về một
    // cái mã lỗi GONE - 410 (lỗi này được FE định nghĩa riêng trong file authorizeAxios)
    if (error?.message?.includes('jwt expired')) {

      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }

    // Nếu như cái accessToken nó không hợp lệ do bất kỳ điều gì khác vụ hết hạn thì chúng ta cứ
    // thẳng tay trả về mã 401 cho phía FE gọi api sign_out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

// Middleware để xác thực token nhưng không bắt buộc (dành cho API có thể truy cập public)
const optionalAuth = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    // Không có token, xem như Guest
    req.jwtDecoded = null
    return next()
  }

  try {
    const accessTokenDecoded = await jwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    req.jwtDecoded = await authToken.resolveUser(accessTokenDecoded)
    next()
  } catch (error) {
    // Nếu có token nhưng lỗi (hết hạn, sai chữ ký, v.v.), vẫn cho qua nhưng với vai trò Guest
    // Hoặc có thể trả về lỗi tuỳ thuộc vào requirement, nhưng ở đây ta xem như Guest
    req.jwtDecoded = null
    next()
  }
}

export const authMiddleware = {
  isAuthorized,
  optionalAuth
}
