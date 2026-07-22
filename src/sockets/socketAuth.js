import { jwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import { authToken } from '~/utils/authToken'

// Parse chuỗi cookie thô từ handshake header thành object { key: value }
const parseCookie = (cookieHeader) => {
  const out = {}
  if (!cookieHeader) return out
  cookieHeader.split(';').forEach(pair => {
    const idx = pair.indexOf('=')
    if (idx > -1) {
      out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim())
    }
  })
  return out
}

// Middleware xác thực kết nối socket qua accessToken trong cookie (giống HTTP authMiddleware).
// Cố ý "lenient": token hợp lệ -> gắn socket.userId; không có/không hợp lệ -> vẫn cho kết nối
// nhưng KHÔNG có userId, nên sẽ không join được các room nhạy cảm (vd room comment của card).
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const cookies = parseCookie(socket.handshake?.headers?.cookie)
    const token = cookies.accessToken
    if (token) {
      const decoded = await jwtProvider.verifyToken(token, env.ACCESS_TOKEN_SECRET_SIGNATURE)
      const authenticatedUser = await authToken.resolveUser(decoded)
      socket.userId = authenticatedUser?._id
    }
  } catch (error) {
    // Token hết hạn/sai chữ ký -> bỏ qua, socket.userId để trống
  }
  next()
}
