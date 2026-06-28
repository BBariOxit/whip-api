import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouter } from './boardRoute'
import { columnRouter } from './columnRoute'
import { cardRouter } from './cardRoute'
import { userRoute } from './userRoute'
import { invitationRoute } from './invitationRoute'
import { labelRouter } from './labelRoute'
import { activityRouter } from './activityRoute'
import { customFieldRouter } from './customFieldRoute'
import { commentRouter } from './commentRoute'
import { workspaceRoute } from './workspaceRoute'

const Router = express.Router()
//check APIs v1/status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 are ready to use' })
})
// Board APIs
Router.use('/boards', boardRouter)
Router.use('/boards/:boardId/custom-fields', customFieldRouter)
// Column APIs
Router.use('/columns', columnRouter)
// Card APIs
Router.use('/cards', cardRouter)
// User APIs
Router.use('/users', userRoute)

// Invitation APIs
Router.use('/invitations', invitationRoute)

// Label APIs
Router.use('/labels', labelRouter)

// Activity APIs
Router.use('/activities', activityRouter)

// Comment APIs
Router.use('/comments', commentRouter)

// Workspace APIs
Router.use('/workspaces', workspaceRoute)

export const APIs_V1 = Router