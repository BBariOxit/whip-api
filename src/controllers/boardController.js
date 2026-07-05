import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
import { cardService } from '~/services/cardService'
import { columnService } from '~/services/columnService'
import { notificationService } from '~/services/notificationService'
import { NOTIFICATION_TYPES } from '~/utils/constants'


const createNew = async (req, res, next) => {
  try {
    // console.log('req.body', req.body)
    // console.log('req.query', req.query)
    // console.log('req.param', req.query)

    const userId = req.jwtDecoded._id

    // điều hướng dữ liệu qua tầng service
    const createBoard = await boardService.createNew(userId, req.body)

    // có kq thì trả về phía client
    res.status(StatusCodes.CREATED).json(createBoard)

    // Thông báo in-app cho thành viên workspace: có board mới — best-effort, không chặn response
    if (createBoard?.workspaceId) {
      notificationService.notifyWorkspaceBoardChange({
        io: req.app.get('socketio'),
        type: NOTIFICATION_TYPES.BOARD_CREATED,
        workspaceId: createBoard.workspaceId.toString(),
        boardTitle: createBoard.title,
        boardId: createBoard._id.toString(),
        actorId: userId
      })
    }
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded?._id
    const boardId = req.params.id

    // điều hướng dữ liệu qua tầng service
    const board = await boardService.getDetails(userId, boardId)
    if (board) {
      board.userAccessRole = req.boardAccessRole || 'viewer'
    }
    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}

const updateVisibility = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const { type } = req.body

    const updatedBoard = await boardService.updateVisibility(userId, boardId, type)

    res.status(StatusCodes.OK).json({ message: `Board visibility changed to ${type} successfully!`, board: updatedBoard })
  } catch (error) {
    next(error)
  }
}

const moveCardifferentColumn = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await boardService.moveCardifferentColumn(req.body, userId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    const { page, itemsPerPage, q, workspaceId } = req.query
    const queryFilters = q || {}
    
    if (workspaceId !== undefined) {
      queryFilters.workspaceId = workspaceId
    }

    const results = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)

    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const result = await boardService.deleteItem(boardId)
    res.status(StatusCodes.OK).json(result)

    // Thông báo in-app cho thành viên workspace: 1 board vừa bị xoá — best-effort, không chặn response
    // (board đã bị xoá nên không truyền boardId để điều hướng)
    if (result?.workspaceId) {
      notificationService.notifyWorkspaceBoardChange({
        io: req.app.get('socketio'),
        type: NOTIFICATION_TYPES.BOARD_DELETED,
        workspaceId: result.workspaceId.toString(),
        boardTitle: result.boardTitle,
        actorId: req.jwtDecoded._id
      })
    }
  } catch (error) {
    next(error)
  }
}

const bulkDeleteItems = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { boardIds } = req.body

    const result = await boardService.bulkDeleteItems(userId, boardIds)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTemplates = async (req, res, next) => {
  try {
    const results = await boardService.getTemplates()
    res.status(StatusCodes.OK).json(results)
  } catch (error) {
    next(error)
  }
}

const cloneTemplate = async (req, res, next) => {
  try {
    // templateBoardId đã được boardValidation.cloneTemplate validate (required + đúng định dạng ObjectId)
    const userId = req.jwtDecoded._id
    const { templateBoardId } = req.body

    const newBoard = await boardService.cloneTemplate(userId, templateBoardId)
    res.status(StatusCodes.CREATED).json({ newBoardId: newBoard._id })
  } catch (error) {
    next(error)
  }
}

const getArchivedItems = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const archivedItems = await boardService.getArchivedItems(boardId)
    res.status(StatusCodes.OK).json(archivedItems)
  } catch (error) {
    next(error)
  }
}

const getCardTemplates = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const templates = await cardService.getTemplatesByBoardId(boardId)
    res.status(StatusCodes.OK).json(templates)
  } catch (error) {
    next(error)
  }
}

const getColumnTemplates = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const templates = await columnService.getColumnTemplatesByBoardId(boardId)
    res.status(StatusCodes.OK).json(templates)
  } catch (error) {
    next(error)
  }
}

const joinBoard = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id

    const newMember = await boardService.joinBoard(userId, boardId)
    res.status(StatusCodes.OK).json({ message: 'Joined successfully!', newMember })
  } catch (error) {
    next(error)
  }
}

const leaveBoard = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id

    const result = await boardService.leaveBoard(userId, boardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getStarredBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const results = await boardService.getStarredBoards(userId)
    res.status(StatusCodes.OK).json(results)
  } catch (error) {
    next(error)
  }
}

const toggleStarred = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const result = await boardService.toggleStarred(userId, boardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
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
  getCardTemplates,
  getColumnTemplates,
  joinBoard,
  leaveBoard,
  getStarredBoards,
  toggleStarred
}