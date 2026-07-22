import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const buckets = new Map()

const create = ({ windowMs, max, message }) => (req, res, next) => {
  const now = Date.now()
  const key = `${req.ip}:${req.baseUrl}${req.path}`
  const current = buckets.get(key)
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current

  bucket.count += 1
  buckets.set(key, bucket)

  res.set('RateLimit-Limit', String(max))
  res.set('RateLimit-Remaining', String(Math.max(0, max - bucket.count)))
  res.set('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))

  if (bucket.count > max) {
    res.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)))
    return next(new ApiError(StatusCodes.TOO_MANY_REQUESTS, message))
  }

  // Opportunistic cleanup keeps memory bounded without a background timer.
  if (buckets.size > 10000) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(bucketKey)
    }
    while (buckets.size > 10000) {
      buckets.delete(buckets.keys().next().value)
    }
  }

  next()
}

export const authRateLimitMiddleware = {
  login: create({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many sign-in attempts. Try again later.' }),
  oauth: create({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many OAuth attempts. Try again later.' }),
  passwordChange: create({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many password attempts. Try again later.' }),
  passwordResetRequest: create({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many password reset requests. Try again later.' }),
  passwordReset: create({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many password reset attempts. Try again later.' })
}
