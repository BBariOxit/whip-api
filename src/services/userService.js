import crypto from 'crypto'
import { userModel } from '~/models/userModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { pickUser } from '~/utils/formatter'
import { brevoProvider } from '~/providers/brevoProvider'
import { env } from '~/config/environment'
import { jwtProvider } from '~/providers/JwtProvider'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'

const PASSWORD_RESET_TOKEN_TTL_MS = 15 * 60 * 1000
const PASSWORD_RESET_RESPONSE = {
  message: 'If an active account exists for that email, a password reset link has been sent.'
}

const buildTokenPayload = (user) => ({
  _id: user._id,
  email: user.email,
  avatar: user.avatar,
  displayName: user.displayName,
  tokenVersion: user.tokenVersion || 0
})

const getWebsiteOrigin = () => (
  env.BUILD_MODE === 'dev' ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION
)

const isAllowedGitHubRedirectUri = (redirectUri) => {
  try {
    const candidate = new URL(redirectUri)
    const allowedOrigins = [env.WEBSITE_DOMAIN_DEVELOPMENT, env.WEBSITE_DOMAIN_PRODUCTION]
      .filter(Boolean)
      .map(value => new URL(value).origin)

    return allowedOrigins.includes(candidate.origin) && candidate.pathname === '/login' && !candidate.search && !candidate.hash
  } catch {
    return false
  }
}

const createNew = async (reqBody) => {
  try {
    // Kiểm tra email đã tồn tại hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    // tạo data để lưu vào db
    // phần trước dấu @ là tên của người dùng. vd: phanbao@gmail.com -> nameFromEmail = phanbao
    const nameFromEmail = reqBody.email.split('@')[0]

    // Gắn avatar mặc định từ ui-avatars.com
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameFromEmail)}&background=random&color=fff`

    const newUser = {
      email: reqBody.email,
      password: await bcryptjs.hash(reqBody.password, 12), // mã hóa password
      username: nameFromEmail,
      // sẽ hiện thị ra tên người dùng (ví dụ: khi đăng ký tài khoản phanbao@gmail.com thì hiển thị username là phanbao và displayName là phanbao)
      displayName: nameFromEmail,
      avatar: defaultAvatar, // Thêm avatar
      verifyToken: crypto.randomUUID() // tạo mã token xác thực
    }

    // thực hiện lưu thông tin user vào db
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Link xác thực tài khoản
    const verificationLink = `${env.BUILD_MODE === 'dev' ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    // Tiêu đề email
    const customSubject = 'Confirm your account - Whip App'
    // Nội dung email
    const customHTMLContent = `
      <h3>Welcome to Whip App!</h3>
      <p>Please click the link below to verify your account:</p>
      <a href="${verificationLink}">Verify Account</a>`

    // gửi email cho người dùng xác thực tài khoản
    await brevoProvider.sendEmail(
      getNewUser.email,
      customSubject,
      customHTMLContent
    )

    // return trả về dữ liệu cho phía controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account already activated')
    if (reqBody.token !== existUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')
    }

    // nếu như mọi thứ ok thì update thông tin user để verify tài khoản
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    // update user trong database
    const updatedUser = await userModel.update(existUser._id, updateData)
    // return dữ liệu cho phía controller
    return pickUser(updatedUser)

  } catch (error) {throw error}
}

const login = async (reqBody) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser || !existUser.password) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your email or password is incorrect')
    }
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not activated')
    if (!(await bcryptjs.compare(reqBody.password, existUser.password))) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your email or password is incorrect')
    }

    // Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
    // tạo thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = buildTokenPayload(existUser)

    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5 // 5 giây để test accessToken hết hạn
    )
    const refreshToken = await jwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15 // 15 giây để test refreshToken hết hạn
    )

    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {throw error}
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await jwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    const user = await userModel.findOneById(refreshTokenDecoded._id)
    if (!user || !user.isActive || (user.tokenVersion || 0) !== (refreshTokenDecoded.tokenVersion || 0)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Session is no longer valid')
    }
    const userInfo = buildTokenPayload(user)

    // Tạo accessToken mới
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 giây để test accessToken hết hạn
      env.ACCESS_TOKEN_LIFE // 1 tiếng
    )

    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneById(userId)
    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    let updatedUser = {}

    if (userAvatarFile) {
      // trường hợp upload file lên cloudinary
      const uploadResult = await cloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      // lưu lại secure_url của cái file ảnh vào trong db
      updatedUser = await userModel.update(userId, {
        avatar: uploadResult.secure_url
      })
    } else {
      // trường hợp update các thông tin chung, vd displayname
      if (!reqBody.displayName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No profile information to update')
      }
      updatedUser = await userModel.update(userId, {
        displayName: reqBody.displayName
      })
    }
    // return dữ liệu cho phía controller
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const changePassword = async (userId, reqBody) => {
  const user = await userModel.findOneById(userId)
  if (!user || !user.isActive) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
  if (!user.password) {
    throw new ApiError(StatusCodes.CONFLICT, 'Password login is not enabled for this account')
  }

  const currentPasswordMatches = await bcryptjs.compare(reqBody.current_password, user.password)
  if (!currentPasswordMatches) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your current password is incorrect')
  }

  const reusesCurrentPassword = await bcryptjs.compare(reqBody.new_password, user.password)
  if (reusesCurrentPassword) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'New password must be different from the current password')
  }

  const passwordHash = await bcryptjs.hash(reqBody.new_password, 12)
  const updatedUser = await userModel.updatePassword(userId, passwordHash)
  if (!updatedUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')

  return { userId: updatedUser._id.toString(), passwordChanged: true }
}

const requestPasswordReset = async ({ email }) => {
  const user = await userModel.findOneByEmail(email)
  if (!user?.isActive) return PASSWORD_RESET_RESPONSE

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  await userModel.savePasswordResetToken(user._id, tokenHash, Date.now() + PASSWORD_RESET_TOKEN_TTL_MS)

  const resetLink = `${getWebsiteOrigin()}/reset-password?token=${token}`
  const subject = 'Reset your Whip password'
  const htmlContent = `
    <h3>Reset your Whip password</h3>
    <p>This link expires in 15 minutes and can only be used once.</p>
    <a href="${resetLink}">Reset password</a>
    <p>If you did not request this, you can safely ignore this email.</p>`

  await brevoProvider.sendEmail(user.email, subject, htmlContent)
  return PASSWORD_RESET_RESPONSE
}

const resetPassword = async ({ token, new_password }) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const user = await userModel.findOneByPasswordResetToken(tokenHash)
  if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, 'Password reset link is invalid or expired')

  if (user.password && await bcryptjs.compare(new_password, user.password)) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'New password must be different from the current password')
  }

  const passwordHash = await bcryptjs.hash(new_password, 12)
  const updatedUser = await userModel.resetPassword(tokenHash, passwordHash)
  if (!updatedUser) throw new ApiError(StatusCodes.BAD_REQUEST, 'Password reset link is invalid or expired')

  return { userId: updatedUser._id.toString(), passwordReset: true }
}

/**
 * Helper function dùng chung: tạo tokens cho OAuth user
 */
const _generateTokensForOAuthUser = async (user) => {
  const userInfo = buildTokenPayload(user)

  const accessToken = await jwtProvider.generateToken(
    userInfo,
    env.ACCESS_TOKEN_SECRET_SIGNATURE,
    env.ACCESS_TOKEN_LIFE
  )
  const refreshToken = await jwtProvider.generateToken(
    userInfo,
    env.REFRESH_TOKEN_SECRET_SIGNATURE,
    env.REFRESH_TOKEN_LIFE
  )

  return { accessToken, refreshToken, ...pickUser(user) }
}

/**
 * Google Login - Dùng access_token từ Google để lấy user info và đăng nhập / tạo user mới
 */
const googleLogin = async (accessToken) => {
  try {
    // Lấy user info từ Google bằng access_token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (!userInfoResponse.ok) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Google authentication failed')
    }
    const googleUser = await userInfoResponse.json()

    if (!googleUser.email || !googleUser.email_verified) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'A verified Google email is required')
    }

    const { name, picture } = googleUser
    const email = googleUser.email.toLowerCase()

    // Tìm user theo email
    let user = await userModel.findOneByEmail(email)

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      const nameFromEmail = email.split('@')[0]
      const newUser = {
        email: email,
        password: null,
        username: nameFromEmail,
        displayName: name || nameFromEmail,
        avatar: picture || null,
        isActive: true,
        verifyToken: null,
        loginType: 'google'
      }
      const createdUser = await userModel.createNew(newUser)
      user = await userModel.findOneById(createdUser.insertedId)
    } else if (!user.isActive) {
      // Nếu user đã tồn tại nhưng chưa active (đăng ký email chưa verify), activate luôn
      user = await userModel.update(user._id, { isActive: true, verifyToken: null })
    }

    return await _generateTokensForOAuthUser(user)
  } catch (error) { throw error }
}

/**
 * GitHub Login - Đổi authorization code lấy access_token, rồi lấy user info
 */
const githubLogin = async ({ code, redirectUri }) => {
  try {
    if (!isAllowedGitHubRedirectUri(redirectUri)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'GitHub redirect URI is invalid')
    }

    const clientId = env.BUILD_MODE === 'production' ? env.GITHUB_CLIENT_ID_PRODUCTION : env.GITHUB_CLIENT_ID_LOCAL
    const clientSecret = env.BUILD_MODE === 'production' ? env.GITHUB_CLIENT_SECRET_PRODUCTION : env.GITHUB_CLIENT_SECRET_LOCAL
    if (!clientId || !clientSecret) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'GitHub authentication is not configured')
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    })
    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, tokenData.error_description || 'GitHub authentication failed')
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    if (!userResponse.ok) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Cannot get GitHub account information')
    const githubUser = await userResponse.json()

    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    if (!emailsResponse.ok) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Cannot get verified GitHub email')
    const emails = await emailsResponse.json()
    const verifiedEmail = emails.find(item => item.primary && item.verified)
      || emails.find(item => item.verified)
    if (!verifiedEmail?.email) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'A verified GitHub email is required')
    }
    const email = verifiedEmail.email.toLowerCase()

    // Tìm user theo email
    let user = await userModel.findOneByEmail(email)

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      const nameFromEmail = email.split('@')[0]
      const newUser = {
        email: email,
        password: null,
        username: githubUser.login || nameFromEmail,
        displayName: githubUser.name || githubUser.login || nameFromEmail,
        avatar: githubUser.avatar_url || null,
        isActive: true,
        verifyToken: null,
        loginType: 'github'
      }
      const createdUser = await userModel.createNew(newUser)
      user = await userModel.findOneById(createdUser.insertedId)
    } else if (!user.isActive) {
      // Nếu user đã tồn tại nhưng chưa active, activate luôn
      user = await userModel.update(user._id, { isActive: true, verifyToken: null })
    }

    return await _generateTokensForOAuthUser(user)
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update,
  changePassword,
  requestPasswordReset,
  resetPassword,
  googleLogin,
  githubLogin
}
