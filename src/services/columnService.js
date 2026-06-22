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

    // Khôi phục toàn bộ card thuộc column (unset _destroy)
    // Wait, we need to implement restoreManyByColumnId in cardModel, or just use updateMany.
    // Let's implement restoreManyByColumnId in cardModel or updateMany here.
    // Actually, I forgot to add restoreManyByColumnId to cardModel. I will use updateMany via cardModel or add it.
    // Let's call cardModel.restoreManyByColumnId and I will add it to cardModel next.
    await cardModel.restoreManyByColumnId(columnId)

    // Thêm lại columnId vào mảng columnOrderIds của Board chứa nó
    await boardModel.pushColumnOrderIds(targetColumn)

    return restoredColumn
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
  restoreColumn
}