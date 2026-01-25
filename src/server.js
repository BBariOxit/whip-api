/* eslint-disable no-console */
import 'dotenv/config'
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from './config/mongodb'
import { mapOrder } from '~/utils/sorts.js'

const START_SERVER = () => {
  const app = express()

  const hostname = 'localhost'
  const port = 2008

  app.get('/', async (req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    process.exit(0)
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    console.log(`Hello PhanBao, I am running at ${ hostname }:${ port }/`)
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