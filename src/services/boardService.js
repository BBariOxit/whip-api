/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { labelModel } from '~/models/labelModel'
import { GET_DB } from '~/config/mongodb'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { ObjectId } from 'mongodb'

const createNew = async (userId, reqBody) => {
  try {
    // xử lý logic dữ liệu
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // gọi tới tầng model để xử lý lưu bản ghi newBoard vào trong database
    const createdBoard = await boardModel.createNew(userId, newBoard)
    // console.log(createdBoard)

    // lấy bản ghi board sau khi gọi (tùy dự án)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // trả kq về , trong service luôn phải có return
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (userId, boardId) => {
  try {
    if (!OBJECT_ID_RULE.test(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'board not found!')
    }

    // 👑 CHỐT CHẶN BẢO MẬT (Gatekeeper)
    const isOwner = userId && board.ownerIds?.some(id => id.toString() === userId)
    const isMember = userId && board.memberIds?.some(id => id.toString() === userId)
    const isAuthorized = isOwner || isMember

    if (board.type === 'private' && !isAuthorized) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied. You do not have permission to view this private board.')
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

const updateVisibility = async (userId, boardId, type) => {
  try {
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const isOwner = board.ownerIds?.some(id => id.toString() === userId)
    if (!isOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only the creator of this board can change its visibility!')
    }

    const updatedBoard = await boardModel.update(boardId, {
      type: type,
      updatedAt: Date.now()
    })

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (bản chất là xóa cái _id của Card ra khỏi mảng cũ)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
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

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters
    )

    return results
  } catch (error) { throw error }
}

const deleteItem = async (boardId) => {
  try {
    const targetBoard = await boardModel.findOneById(boardId)
    if (!targetBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Xoá board
    await boardModel.deleteOneById(boardId)

    // Xoá toàn bộ column thuộc board
    await columnModel.deleteManyByBoardId(boardId)

    // Xoá toàn bộ card thuộc board
    await cardModel.deleteManyByBoardId(boardId)

    return { deleteResult: 'Board and its Columns, Cards deleted successfully!' }
  } catch (error) {
    throw error
  }
}

const bulkDeleteItems = async (userId, boardIds) => {
  try {
    if (!boardIds || !Array.isArray(boardIds) || boardIds.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Board IDs array is empty')
    }

    const objectIds = boardIds.map(id => new ObjectId(id))
    const db = GET_DB()

    // Find boards that actually belong to the user and match the IDs
    const boardsToDelete = await db.collection(boardModel.BOARD_COLLECTION_NAME).find({
      _id: { $in: objectIds },
      ownerIds: { $all: [new ObjectId(userId)] }
    }).toArray()

    const validBoardIds = boardsToDelete.map(b => b._id)

    if (validBoardIds.length > 0) {
      // Delete boards
      await db.collection(boardModel.BOARD_COLLECTION_NAME).deleteMany({
        _id: { $in: validBoardIds }
      })

      // Delete columns
      await db.collection(columnModel.COLUMN_COLLECTION_NAME).deleteMany({
        boardId: { $in: validBoardIds }
      })

      // Delete cards
      await db.collection(cardModel.CARD_COLLECTION_NAME).deleteMany({
        boardId: { $in: validBoardIds }
      })

      // Delete labels
      await db.collection(labelModel.LABEL_COLLECTION_NAME).deleteMany({
        boardId: { $in: validBoardIds }
      })
    }

    return { deleteResult: `Successfully deleted ${validBoardIds.length} boards!` }
  } catch (error) {
    throw error
  }
}

const getTemplates = async () => {
  try {
    const results = await boardModel.getTemplates()
    return results
  } catch (error) { throw error }
}

const cloneTemplate = async (userId, templateBoardId) => {
  try {
    // 1. Get template board details (includes its columns and cards)
    // using user ID null because template doesn't belong to any user, but getDetails checks owners/members. 
    // Wait, getDetails checks owners/members! So getDetails will fail for a template board with a normal userId.
    // Let's create a specific fetch or modify getDetails. Actually, template boards have empty ownerIds.
    // We might need to just find it using findOneById, then fetch columns.
    const templateBoard = await boardModel.findOneById(templateBoardId)
    if (!templateBoard || !templateBoard.isTemplate) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Template not found!')
    }

    // Fetch columns of the template
    const templateColumns = await GET_DB().collection(columnModel.COLUMN_COLLECTION_NAME).find({
      boardId: templateBoard._id
    }).toArray()

    // Fetch cards of the template
    const templateCards = await GET_DB().collection(cardModel.CARD_COLLECTION_NAME).find({
      boardId: templateBoard._id
    }).toArray()

    // Fetch labels of the template
    const templateLabels = await GET_DB().collection(labelModel.LABEL_COLLECTION_NAME).find({
      boardId: templateBoard._id
    }).toArray()

    // 2. Create new board based on template
    const newTitle = `${templateBoard.title} (Bản sao)`
    const newBoardData = {
      title: newTitle,
      slug: slugify(newTitle),
      description: templateBoard.description,
      type: 'private', // User's cloned board might be private by default
      background: templateBoard.background,
      isTemplate: false
    }

    const createdBoard = await boardModel.createNew(userId, newBoardData)
    const newBoardId = createdBoard.insertedId

    // 3. Clone columns
    const columnIdMapping = {}
    const newColumnOrderIds = []

    for (const col of templateColumns) {
      const newColData = {
        boardId: newBoardId,
        title: col.title,
        cardOrderIds: [],
        createdAt: Date.now(),
        updatedAt: null,
        _destroy: false
      }
      const createdCol = await GET_DB().collection(columnModel.COLUMN_COLLECTION_NAME).insertOne(newColData)
      columnIdMapping[col._id.toString()] = createdCol.insertedId
      newColumnOrderIds.push(createdCol.insertedId)
    }

    // Clone labels
    const labelIdMapping = {}
    const newLabelsData = []
    for (const label of templateLabels) {
      const newLabelId = new ObjectId()
      labelIdMapping[label._id.toString()] = newLabelId
      const newLabel = {
        ...label,
        _id: newLabelId,
        boardId: newBoardId,
        createdAt: Date.now()
      }
      newLabelsData.push(newLabel)
    }
    
    if (newLabelsData.length > 0) {
      await GET_DB().collection(labelModel.LABEL_COLLECTION_NAME).insertMany(newLabelsData)
    }

    // Clone cards
    const cardIdMapping = {}
    const newCardsData = []
    for (const card of templateCards) {
      const newColId = columnIdMapping[card.columnId.toString()]
      if (newColId) {
        const newCardId = new ObjectId()
        cardIdMapping[card._id.toString()] = newCardId

        // Map labelIds
        const mappedLabelIds = (card.labelIds || []).map(oldLabelId => labelIdMapping[oldLabelId.toString()]).filter(id => id)

        const newCard = {
          ...card,
          _id: newCardId,
          boardId: newBoardId,
          columnId: newColId,
          labelIds: mappedLabelIds,
          memberIds: [], // Reset members
          createdAt: Date.now(),
          updatedAt: null
        }
        newCardsData.push(newCard)
      }
    }

    if (newCardsData.length > 0) {
      await GET_DB().collection(cardModel.CARD_COLLECTION_NAME).insertMany(newCardsData)
    }

    // 4. Update new board's columnOrderIds and columns' cardOrderIds
    if (newColumnOrderIds.length > 0) {
      const orderedNewColIds = templateBoard.columnOrderIds
        .map(oldId => columnIdMapping[oldId.toString()])
        .filter(id => id)

      await boardModel.update(newBoardId, {
        columnOrderIds: orderedNewColIds
      })

      // Update cardOrderIds for new columns
      for (const col of templateColumns) {
        const newColId = columnIdMapping[col._id.toString()]
        if (newColId && col.cardOrderIds && col.cardOrderIds.length > 0) {
          // Map old card IDs to new card IDs
          const newCardOrderIds = col.cardOrderIds
            .map(oldCardId => cardIdMapping[oldCardId.toString()])
            .filter(id => id)

          await columnModel.update(newColId, {
            cardOrderIds: newCardOrderIds
          })
        }
      }
    }

    return await boardModel.findOneById(newBoardId)
  } catch (error) {
    throw error
  }
}

const getArchivedItems = async (boardId) => {
  try {
    const archivedCards = await cardModel.getArchivedByBoardId(boardId)
    const archivedColumns = await columnModel.getArchivedByBoardId(boardId)

    return {
      cards: archivedCards,
      columns: archivedColumns
    }
  } catch (error) {
    throw error
  }
}

const joinBoard = async (userId, boardId) => {
  try {
    const board = await boardModel.findOneById(boardId)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    if (board.type === 'private') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot join a private board!')
    }

    const isAlreadyJoined = board.memberIds?.some(id => id.toString() === userId.toString())
    const isOwner = board.ownerIds?.some(id => id.toString() === userId.toString())
    
    if (isAlreadyJoined || isOwner) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You are already a member of this board!')
    }

    await boardModel.pushMemberIds(boardId, userId)
    
    const newMember = await userModel.findOneById(userId)
    
    return {
      _id: newMember._id,
      email: newMember.email,
      username: newMember.username,
      displayName: newMember.displayName,
      avatar: newMember.avatar
    }
  } catch (error) { throw error }
}

const leaveBoard = async (userId, boardId) => {
  try {
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const isMember = board.memberIds?.some(id => id.toString() === userId.toString())
    if (!isMember) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'You are not a member of this board!')
    }

    const isOwner = board.ownerIds?.some(id => id.toString() === userId.toString())
    if (isOwner) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The board owner cannot leave. Transfer ownership first or delete the board.'
      )
    }

    const result = await boardModel.pullMemberIds(boardId, userId)
    return result
  } catch (error) {
    throw error
  }
}

const getStarredBoards = async (userId) => {
  try {
    const results = await boardModel.getStarredBoards(userId)
    return results
  } catch (error) {
    throw error
  }
}

const toggleStarred = async (userId, boardId) => {
  try {
    if (!OBJECT_ID_RULE.test(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }

    const board = await boardModel.findOneById(boardId)
    if (!board || board._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // 👑 Chốt chặn bảo mật: không cho user gắn sao một board private mà họ không thuộc về.
    // (Cùng nguyên tắc gatekeeper như getDetails ở trên)
    const isOwner = board.ownerIds?.some(id => id.toString() === userId)
    const isMember = board.memberIds?.some(id => id.toString() === userId)
    if (board.type === 'private' && !isOwner && !isMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied. You cannot star a private board you do not belong to.')
    }

    // Toggle: đang có sao thì gỡ, chưa có thì thêm
    const isStarred = board.starredBy?.some(id => id.toString() === userId)
    if (isStarred) {
      await boardModel.unstarBoard(boardId, userId)
      return { boardId, starred: false }
    }
    await boardModel.starBoard(boardId, userId)
    return { boardId, starred: true }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  updateVisibility,
  moveCardifferentColumn,
  getBoards,
  getTemplates,
  cloneTemplate,
  deleteItem,
  bulkDeleteItems,
  getArchivedItems,
  joinBoard,
  leaveBoard,
  getStarredBoards,
  toggleStarred
}