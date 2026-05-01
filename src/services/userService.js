import { userModel } from "~/models/userModel"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from "~/utils/formatter"
import { resendProvider } from "~/providers/resendProvider"
import { env } from "~/config/environment"
import { jwtProvider } from "~/providers/JwtProvider"

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

const verifyAccount = async () => {
  try { 
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account already activated')
    if (reqBody.token !== existUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')
    }

    // nếu như mọi thứ ok thì update thông tin user để verify tài khoản
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    // update user trong database
    const updatedUser = await userModel.update(existUser._id, updateData)
    // return dữ liệu cho phía controller
    return pickUser(updatedUser)
    
  } catch (error) {throw error}
}

const login = async () => {
  try { 
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your account is not activated')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)){
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your email or password is incorrect')
    } 

    // Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
    // tạo thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await jwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )
    
    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {throw error}
}

export const userService = {
  createNew,
  verifyAccount,
  login
}