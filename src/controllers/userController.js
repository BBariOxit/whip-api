import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const createNew = async (req, res, next) => {
  try {
    // Điều phối dữ liệu sang tầng Service để xử lý nghiệp vụ lưu trữ
    const createdUser = await userService.createNew(req.body)
    
    // Trả về kết quả cho phía Client với mã 201 (CREATED)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { 
    next(error) 
  }
}

export const userController = {
  createNew
}