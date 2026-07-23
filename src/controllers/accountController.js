import { StatusCodes } from 'http-status-codes'
import { accountService } from '~/services/accountService'
import { authCookies } from '~/utils/authCookies'

const disconnectUserSockets = (req, userId) => {
  if (!userId) return
  req.app.get('socketio')?.in(`user:${userId}`).disconnectSockets(true)
}

const setJsonAttachmentHeaders = (res, filename) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
}

const exportAccountData = async (req, res, next) => {
  try {
    const data = await accountService.exportAccountData(req.jwtDecoded._id)
    setJsonAttachmentHeaders(res, `whip-account-data-${new Date().toISOString().slice(0, 10)}.json`)
    res.status(StatusCodes.OK).send(JSON.stringify(data, null, 2))
  } catch (error) {
    next(error)
  }
}

const exportPersonalBoards = async (req, res, next) => {
  try {
    const data = await accountService.exportPersonalBoards(req.jwtDecoded._id)
    setJsonAttachmentHeaders(res, `whip-personal-boards-${new Date().toISOString().slice(0, 10)}.json`)
    res.status(StatusCodes.OK).send(JSON.stringify(data, null, 2))
  } catch (error) {
    next(error)
  }
}

const requestAccountDeletion = async (req, res, next) => {
  try {
    const result = await accountService.requestAccountDeletion(req.jwtDecoded._id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await accountService.deleteAccount(userId, req.body)

    authCookies.clear(res)
    disconnectUserSockets(req, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const accountController = {
  exportAccountData,
  exportPersonalBoards,
  requestAccountDeletion,
  deleteAccount
}
