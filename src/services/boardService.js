/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { OBJECT_ID_RULE } from '~/utils/validators'

const createNew = async (reqBody) => {
  try {
    // xử lý logic dữ liệu
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // gọi tới tầng model để xử lý lưu bản ghi newBoard vào trong database
    const createdBoard = await boardModel.createNew(newBoard)
    console.log(createdBoard)

    // lấy bản ghi board sau khi gọi (tùy dự án)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // trả kq về , trong service luôn phải có return
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    if (!OBJECT_ID_RULE.test(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'board not found!')
    }

    // // B1: structuredClone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu,
    // // tùy mục đích về sau mà có cần structuredClone hay không.
    // const resBoard = structuredClone(board)
    // // B2: đưa card về đúng column của nó
    // resBoard.columns.forEach(column => {
    //   column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
         // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals
    //   // column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    // })
    // // B3: xóa mảng card khỏi board ban đầu
    // delete resBoard.cards

    // khi xài structuredClone, nó làm bay sạch method của ObjectId, gọi .toString() nó sẽ ra cái chuỗi "[object Object]" hoặc mớ hỗn độn nào đó
    // => ép kiểu toàn bộ Object về String trước khi filter, hoặc xài clone deep của lodash

    // B1: Dùng cách này để "String hóa" toàn bộ ObjectId một cách nhanh nhất
    const resBoard = JSON.parse(JSON.stringify(board))

    // B2: đưa card về đúng column của nó
    // bây giờ resBoard._id, column._id, card.columnId... ĐỀU LÀ STRING NGUYÊN BẢN
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId === column._id)
    })

    // B3: xóa mảng card khỏi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (bản chất là xóa cái _id của Card ra khỏi mảng cũ)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.preCardOrderIds,
      updatedAt: Date.now()
    })
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (bản chất là thêm _id của Card vào mảng mới)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nexCardOrderIds,
      updatedAt: Date.now()
    })
    // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
    await cardModel.update(reqBody.currCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Sucessfully!' }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardifferentColumn
}