import { userModel } from "~/models/userModel"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from "~/utils/formatter"
import { resendProvider } from "~/providers/resendProvider"
import { env } from "~/config/environment"


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

    // Link xác thực tài khoản
    const verificationLink = `${env.BUILD_MODE === 'dev' ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    // Tiêu đề email
    const customSubject = 'Confirm your account - Whip App'
    // Nội dung email
    const customHTMLContent = `
      <h3>Welcome to Whip App!</h3>
      <p>Please click the link below to verify your account:</p>
      <a href="${verificationLink}">Verify Account</a>`
    
    // gửi email cho người dùng xác thực tài khoản
    await resendProvider.sendEmail(
      getNewUser.email,
      customSubject,
      customHTMLContent
    )

    // return trả về dữ liệu cho phía controller
    return pickUser(getNewUser)
  } catch (error) {
      throw error
  }
}

export const userService = {
    createNew
}