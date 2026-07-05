import { StatusCodes } from 'http-status-codes'
import { notificationService } from '~/services/notificationService'

const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await notificationService.getForUser(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const markRead = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await notificationService.markAsRead(req.params.id, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const markAllRead = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await notificationService.markAllAsRead(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const remove = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await notificationService.deleteNotification(req.params.id, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const notificationController = {
  getMyNotifications,
  markRead,
  markAllRead,
  remove
}
