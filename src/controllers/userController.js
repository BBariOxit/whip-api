import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'
import { authCookies } from '~/utils/authCookies'

const disconnectUserSockets = (req, userId) => {
  if (!userId) return
  req.app.get('socketio')?.in(`user:${userId}`).disconnectSockets(true)
}

const sendAuthenticatedUser = (res, result) => {
  const { accessToken, refreshToken, ...user } = result
  authCookies.set(res, { accessToken, refreshToken })
  res.status(StatusCodes.OK).json(user)
}

const createNew = async (req, res, next) => {
  try {
    // Điều phối dữ liệu sang tầng Service để xử lý nghiệp vụ lưu trữ
    const createdUser = await userService.createNew(req.body)

    // Trả về kết quả cho phía Client với mã 201 (CREATED)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    // xử lý trả về http only cookie cho phía trình duyệt
    sendAuthenticatedUser(res, result)
  } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
  try {
    // Xóa cookie - đơn giản là làm ngược lại so với việc gán cookie ở hàm login
    authCookies.clear(res)
    disconnectUserSockets(req, req.jwtDecoded?._id)

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    authCookies.setAccess(res, result.accessToken)
    res.status(StatusCodes.OK).json({ refreshed: true })
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In!'))
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const userAvatarFile = req.file
    // console.log('userAvatarFile: ', userAvatarFile)
    const updatedUser = await userService.update(userId, req.body, userAvatarFile)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) { next(error) }
}

const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.jwtDecoded._id, req.body)
    authCookies.clear(res)
    disconnectUserSockets(req, result.userId)
    res.status(StatusCodes.OK).json({ passwordChanged: true })
  } catch (error) { next(error) }
}

const requestPasswordReset = async (req, res, next) => {
  try {
    const result = await userService.requestPasswordReset(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const resetPassword = async (req, res, next) => {
  try {
    const result = await userService.resetPassword(req.body)
    authCookies.clear(res)
    disconnectUserSockets(req, result.userId)
    res.status(StatusCodes.OK).json({ passwordReset: true })
  } catch (error) { next(error) }
}

/**
 * Google Login Controller
 */
const googleLogin = async (req, res, next) => {
  try {
    const result = await userService.googleLogin(req.body.credential)

    sendAuthenticatedUser(res, result)
  } catch (error) { next(error) }
}

/**
 * GitHub Login Controller
 */
const githubLogin = async (req, res, next) => {
  try {
    const result = await userService.githubLogin(req.body)

    sendAuthenticatedUser(res, result)
  } catch (error) { next(error) }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update,
  changePassword,
  requestPasswordReset,
  resetPassword,
  googleLogin,
  githubLogin
}
