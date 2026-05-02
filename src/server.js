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

const START_SERVER = () => {
  const app = express()

  // Fix cái vụ Cache from disk của ExpressJS
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // cấu hình cookiePaser
  app.use(cookieParser())

  // xử lý cors
  app.use(cors(corsOptions))

  //enable req.body json data
  app.use(express.json())

  //use api v1
  app.use('/v1', APIs_V1)

  // middlewares xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // môi trường production
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`3. Production: Hello ${env.AUTHOR}, I am running at port: ${ process.env.PORT }/`)
    })
  } else {
    // môi trường local dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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