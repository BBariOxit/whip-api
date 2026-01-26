/* eslint-disable no-console */
//EX
import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

// Khởi tạo một đối tượng whipDatabaseInstance ban đầu là null (vì chúng ta chưa connect)
let whipDatabaseInstance = null
// khởi tạo một đối tượng client để connect tới mongoDB
const client = new MongoClient(env.MONGODB_URI, {
  // Mấy cái option này để giúp kết nối ổn định hơn với Atlas, đỡ bị timeout
  serverApi: {
    version: ServerApiVersion.v1, // chỉ định 1 cái stable api version của mongoDB
    strict: true,
    deprecationErrors: true,
    family: 4
  },
  // Cái này để bảo Node.js là: "Kệ mẹ chứng chỉ lỗi, cứ kết nối đi bố mày cho phép"
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true
})
// kết nối tới db
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của client
  await client.connect()
  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến whipDatabaseInstance ở trên của chúng ta
  whipDatabaseInstance = client.db(env.DATABASE_NAME)
}

//đóng kết nối tới database khi cần
export const CLOSE_DB = async () => {
  console.log('code chạy vào close')
  await client.close()
}

// Function GET DB (không async) này có nhiệm vụ export ra cái Whip Database Instance
// sau khi đã connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code.
// Lưu ý phải đảm bảo chỉ luôn gọi cái getDB này sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  if (!whipDatabaseInstance) throw new Error('must connect to db first')
  return whipDatabaseInstance
}

