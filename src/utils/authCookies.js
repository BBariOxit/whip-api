import ms from 'ms'
import { env } from '~/config/environment'

const isProduction = env.BUILD_MODE === 'production'
const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/'
}

const getMaxAge = (value, fallback) => {
  try {
    const parsed = ms(value)
    return Number.isFinite(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const setAccessCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    ...baseCookieOptions,
    maxAge: getMaxAge(env.ACCESS_TOKEN_LIFE, ms('1 hour'))
  })
}

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  setAccessCookie(res, accessToken)
  res.cookie('refreshToken', refreshToken, {
    ...baseCookieOptions,
    maxAge: getMaxAge(env.REFRESH_TOKEN_LIFE, ms('14 days'))
  })
}

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', baseCookieOptions)
  res.clearCookie('refreshToken', baseCookieOptions)
}

export const authCookies = {
  set: setAuthCookies,
  setAccess: setAccessCookie,
  clear: clearAuthCookies
}
