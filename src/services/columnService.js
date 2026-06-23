import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    // xử lý cấu trúc data trước khi trả về dữ liệu
    if (getNewColumn) {
      getNewColumn.cards = []
      // cập nhập lại mảng columnOrderIds trong collection board
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'board not found!')
    }
    // xóa column
    await columnModel.deleteOneById(columnId)

    // xóa toàn bộ card thuộc column trên
    await cardModel.deleteManyByColumnId(columnId)

    // Xoá columnId trong mảng columnOrderIds của cái Board chứa nó
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Column and its Cards deleted successfully!' }
  } catch (error) {
    throw error
  }
}

const clearAllCards = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'column not found!')
    }

    // xóa toàn bộ card thuộc column trên
    await cardModel.deleteManyByColumnId(columnId)

    // làm rỗng cardOrderIds
    await columnModel.emptyCardOrderIds(columnId)

    return { deleteResult: 'All cards in column deleted successfully!' }
  } catch (error) {
    throw error
  }
}

const updateAllCardsLayout = async (columnId, newLayout) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'column not found!')
    }

    const result = await cardModel.updateManyCardsLayoutByColumnId(columnId, newLayout)
    return { 
      updatedCount: result.modifiedCount,
      message: `Successfully updated layout for ${result.modifiedCount} cards!` 
    }
  } catch (error) {
    throw error
  }
}

const archiveColumn = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }

    // Archive column (soft delete)
    await columnModel.archiveColumn(columnId)

    // Xóa columnId khỏi mảng columnOrderIds của Board chứa nó
    await boardModel.pullColumnOrderIds(targetColumn)

    return { archiveResult: 'Column and its cards archived successfully!' }
  } catch (error) {
    throw error
  }
}

const restoreColumn = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }

    // Restore column (unset _destroy)
    const restoredColumn = await columnModel.restoreColumn(columnId)

    // Khôi phục column (unset _destroy)
    // Các cards bên trong vốn dĩ không bị đổi _destroy khi archive column, 
    // nên không cần (và không được) tự động updateMany _destroy: false cho chúng.
    // Việc này giúp giữ nguyên trạng thái của những card đã bị archive thủ công từ trước.

    // Thêm lại columnId vào mảng columnOrderIds của Board chứa nó
    await boardModel.pushColumnOrderIds(targetColumn)

    return restoredColumn
  } catch (error) {
    throw error
  }
}

const saveAsTemplate = async (columnId) => {
  try {
    const result = await columnModel.saveAsTemplate(columnId)
    return result
  } catch (error) {
    throw error
  }
}

const getColumnTemplatesByBoardId = async (boardId) => {
  try {
    const result = await columnModel.getTemplatesByBoardId(boardId)
    return result
  } catch (error) {
    throw error
  }
}

const useColumnTemplate = async (templateId, boardId) => {
  try {
    const newColumn = await columnModel.useTemplate(templateId, boardId)
    
    // push columnOrderIds vào board
    if (newColumn) {
      await boardModel.pushColumnOrderIds(newColumn)
    }

    // fetch lại đầy đủ cards để FE render
    const fullColumn = await columnModel.getTemplatesByBoardId(boardId)
    // wait, getTemplatesByBoardId chỉ fetch templates.
    // get lại column bình thường
    const db = require('~/config/mongodb').GET_DB()
    const result = await db.collection(columnModel.COLUMN_COLLECTION_NAME).aggregate([
      { $match: { _id: newColumn._id } },
      { $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'columnId',
          as: 'cards'
      }}
    ]).toArray()
    
    return result[0] || newColumn
  } catch (error) {
    throw error
  }
}

const deleteColumnTemplate = async (templateId) => {
  try {
    const result = await columnModel.deleteTemplate(templateId)
    return result
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  update,
  deleteItem,
  clearAllCards,
  updateAllCardsLayout,
  archiveColumn,
  restoreColumn,
  saveAsTemplate,
  getColumnTemplatesByBoardId,
  useColumnTemplate,
  deleteColumnTemplate
}