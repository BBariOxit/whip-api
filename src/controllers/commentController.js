import { StatusCodes } from 'http-status-codes'
import { commentService } from '~/services/commentService'
import { notificationService } from '~/services/notificationService'

const createNew = async (req, res, next) => {
  try {
    const createdComment = await commentService.createNew(req.body, req.jwtDecoded)

    // Socket: Broadcast comment mới cho tất cả user đang mở Card này
    const io = req.app.get('socketio')
    io.to(`card:${createdComment.cardId.toString()}`).emit('BE_NEW_COMMENT', createdComment)

    res.status(StatusCodes.CREATED).json(createdComment)

    // Thông báo @mention (in-app) cho member được nhắc tên — best-effort, không chặn response
    notificationService.notifyMentions({
      io,
      cardId: createdComment.cardId.toString(),
      actorId: req.jwtDecoded._id,
      actorName: createdComment.userDisplayName,
      content: createdComment.content
    })
  } catch (error) {
    next(error)
  }
}

const getComments = async (req, res, next) => {
  try {
    const { cardId, page, limit } = req.query
    const result = await commentService.getComments(cardId, parseInt(page), parseInt(limit))
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getReplies = async (req, res, next) => {
  try {
    const { parentId } = req.params
    const { page, limit } = req.query
    const result = await commentService.getReplies(parentId, parseInt(page), parseInt(limit))
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const updatedComment = await commentService.updateComment(id, req.body, req.jwtDecoded)

    // Socket: Broadcast comment đã chỉnh sửa cho room
    const io = req.app.get('socketio')
    io.to(`card:${updatedComment.cardId}`).emit('BE_COMMENT_UPDATED', updatedComment)

    res.status(StatusCodes.OK).json(updatedComment)
  } catch (error) {
    next(error)
  }
}

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await commentService.deleteComment(id, req.jwtDecoded)

    // Socket: Broadcast comment đã bị xóa cho room
    const io = req.app.get('socketio')
    io.to(`card:${result.cardId}`).emit('BE_COMMENT_DELETED', {
      commentId: id,
      parentId: result.parentId || null,
      cardId: result.cardId
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const commentController = {
  createNew,
  getComments,
  getReplies,
  updateComment,
  deleteComment
}
