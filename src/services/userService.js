import { userModel } from "~/models/userModel"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from "~/utils/formatter"

const createNew = async (reqBody) => {
  try {
    // Kiểm tra email đã tồn tại hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email) 
    if(existUser){
        throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }  

    // tạo data để lưu vào db
    // phần trước dấu @ là tên của người dùng. vd: phanbao@gmail.com -> nameFromEmail = phanbao
    const nameFromEmail = reqBody.email.split('@')[0] 
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // mã hóa password
      username: nameFromEmail,
      // sẽ hiện thị ra tên người dùng (ví dụ: khi đăng ký tài khoản phanbao@gmail.com thì hiển thị username là phanbao và displayName là phanbao)
      displayName: nameFromEmail, 
      verifyToken: uuidv4(), // tạo mã token xác thực
    }

    // thực hiện lưu thông tin user vào db
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // gửi email cho người dùng xác thực tài khoản
    
    // return trả về dữ liệu cho phía controller
    return pickUser(getNewUser)
  } catch (error) {
      throw error
  }
}

export const userService = {
    createNew
}