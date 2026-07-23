/* eslint-disable no-console */
import exitHook from 'async-exit-hook'
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import { CLOSE_DB, CONNECT_DB } from './config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
// Xử lý socket real-time với gói socket.io
// https://socket.io/get-started/chat/#integrating-socketio
import socketIo from 'socket.io'
import http from 'http'
import { cardCommentSocket } from './sockets/cardCommentSocket'
import { socketAuthMiddleware } from './sockets/socketAuth'
import { notificationModel } from '~/models/notificationModel'
import { workspaceActivityModel } from '~/models/workspaceActivityModel'
import { accountService } from '~/services/accountService'

const START_SERVER = () => {
  const app = express()

  // Production runs behind one trusted reverse proxy; req.ip is then safe for rate limiting.
  if (env.BUILD_MODE === 'production') app.set('trust proxy', 1)

  // Fix cái vụ Cache from disk của ExpressJS
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // cấu hình cookiePaser
  app.use(cookieParser())

  // xử lý cors
  app.use(cors(corsOptions))

  // Import archives may be larger than normal API payloads. Keep the larger
  // limit scoped to import routes; all other JSON requests remain at 1 MB.
  app.use([
    '/v1/boards/import',
    '/v1/boards/import-personal',
    '/v1/workspaces/import'
  ], express.json({ limit: '10mb' }))
  app.use(express.json({ limit: '1mb' }))

  //use api v1
  app.use('/v1', APIs_V1)

  // middlewares xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Tạo một cái server mới bọc thằng app của express để làm real-time với socket.io
  const server = http.createServer(app)
  // khởi tạo biến io với sever và cors
  const io = socketIo(server, { cors: corsOptions })
  // Xác thực socket qua cookie accessToken -> gắn socket.userId (dùng để phân quyền join room)
  io.use(socketAuthMiddleware)
  // Lưu io instance vào app để Controller có thể truy cập qua req.app.get('socketio')
  app.set('socketio', io)
  io.on('connection', (socket) => {
    // Mỗi user tham gia 1 room riêng "user:<id>" để nhận thông báo cá nhân (vd lời mời vào board)
    // được emit server-authoritative từ controller, thay vì broadcast cho tất cả.
    if (socket.userId) socket.join(`user:${socket.userId}`)

    cardCommentSocket(io, socket)
  })

  // môi trường production
  if (env.BUILD_MODE === 'production') {
    // Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(process.env.PORT, () => {
      console.log(`3. Production: Hello ${env.AUTHOR}, I am running at port: ${ process.env.PORT }/`)
    })
  } else {
    // môi trường local dev
    // Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local: Hello ${env.AUTHOR}, I am running at ${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

  exitHook(() => {
    console.log('4. disconnecting MongoDB Cloud Atlas...')
    CLOSE_DB()
    console.log('5. Disconnected!')
  })
}

//chỉ khi kết nối tới Database thành công thì chúng ta mới start server back-end lên
// cách 2: IIFE
(async () => {
  try {
    console.log('1. Connecting to mongoDB atlas ...')
    await CONNECT_DB()
    console.log('2. Connected to mongoDB atlas')
    // Tạo index cho notifications + workspace activities (idempotent) — best-effort, không chặn khởi động
    try {
      await notificationModel.initIndexes()
      await workspaceActivityModel.initIndexes()
      await accountService.initIndexes()
    } catch (indexErr) {
      console.error('initIndexes failed:', indexErr?.message)
    }
    START_SERVER()
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
})()


//chỉ khi kết nối tới Database thành công thì chúng ta mới start server back-end lên
// cách 1
// console.log('1. Connecting to mongoDB atlas ...')
// CONNECT_DB()
//   .then(() => console.log('2. Connected to mongoDB atlas'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.log(error)
//     process.exit(0)
//   })
