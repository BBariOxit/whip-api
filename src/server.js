/* eslint-disable no-console */
import exitHook from 'async-exit-hook'
import express from 'express'
import { CLOSE_DB, CONNECT_DB } from './config/mongodb'
import { env } from '~/config/environment'

const START_SERVER = () => {
  const app = express()

  app.get('/', async (req, res) => {
    // console.log(await GET_DB().listCollections().toArray())
    console.log(process.env)
    process.exit(0)
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

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