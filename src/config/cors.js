import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Cấu hình CORS Option
export const corsOptions = {
  origin: function (origin, callback) {
    // Requests without an Origin header are server-to-server or same-origin.
    if (!origin) {
      return callback(null, true)
    }
    // Only explicitly configured frontend origins may send credentialed requests.
    const configuredOrigins = [
      env.WEBSITE_DOMAIN_DEVELOPMENT,
      env.WEBSITE_DOMAIN_PRODUCTION,
      ...WHITELIST_DOMAINS
    ].filter(Boolean)

    if (configuredOrigins.includes(origin)) {
      return callback(null, true)
    }

    // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  // CORS sẽ cho phép nhận cookies từ request
  credentials: true
}
