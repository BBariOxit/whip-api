import { commentModel } from '~/models/commentModel'
import { userModel } from '~/models/userModel'
import { cardModel } from '~/models/cardModel'

const createNew = async (reqBody, userInfo) => {
  try {
    // 1. Fetch user to get current display info
    const fullUser = await userModel.findOneById(userInfo._id)

    // 2. Prepare new comment data
    const newCommentData = {
      ...reqBody,
      userId: userInfo._id,
      userEmail: userInfo.email,
      userAvatar: fullUser?.avatar || null,
      userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email
    }

    // 3. Khóa đít an toàn: Ngăn chặn lồng đa cấp
    if (newCommentData.parentId) {
      const parentComment = await commentModel.findOneById(newCommentData.parentId)
      if (!parentComment) {
        throw new Error('Comment gốc không tồn tại!')
      }
      if (parentComment.parentId) {
        throw new Error('Chỉ cho phép lồng 1 cấp phản hồi!')
      }
    }

    // 4. Lưu vào DB
    const createdComment = await commentModel.createNew(newCommentData)
    const getNewComment = await commentModel.findOneById(createdComment.insertedId)

    // 5. Nếu là reply, tăng số đếm replyCount của comment gốc
    if (newCommentData.parentId) {
      await commentModel.incrementReplyCount(newCommentData.parentId)
    }

    // 6. Tăng tổng số comment của Card để hiển thị icon ngoài giao diện
    await cardModel.incrementTotalComments(newCommentData.cardId)

    return getNewComment
  } catch (error) {
    throw error
  }
}

const getComments = async (cardId, page, limit) => {
  try {
    const result = await commentModel.getCommentsByCardId(cardId, page, limit)
    return result
  } catch (error) {
    throw error
  }
}

const getReplies = async (parentId, page, limit) => {
  try {
    const result = await commentModel.getRepliesByParentId(parentId, page, limit)
    return result
  } catch (error) {
    throw error
  }
}

const updateComment = async (commentId, reqBody, userInfo) => {
  try {
    const targetComment = await commentModel.findOneById(commentId)
    if (!targetComment) throw new Error('Comment không tồn tại!')

    if (targetComment.userId.toString() !== userInfo._id.toString()) {
      throw new Error('Bạn không có quyền sửa comment này!')
    }

    const updateData = {
      content: reqBody.content,
      updatedAt: Date.now()
    }

    const updatedComment = await commentModel.update(commentId, updateData)
    return updatedComment
  } catch (error) {
    throw error
  }
}

const deleteComment = async (commentId, userInfo) => {
  try {
    const targetComment = await commentModel.findOneById(commentId)
    if (!targetComment) throw new Error('Comment không tồn tại!')

    if (targetComment.userId.toString() !== userInfo._id.toString()) {
      throw new Error('Bạn không có quyền xóa comment này!')
    }

    if (targetComment.parentId) {
      // Là comment con: Xóa nó, giảm replyCount của comment gốc, giảm totalComments của card đi 1
      await commentModel.deleteById(commentId)
      await commentModel.decrementReplyCount(targetComment.parentId)
      await cardModel.decrementTotalComments(targetComment.cardId, 1)
    } else {
      // Là comment gốc: Xóa hết các comment con, đếm số comment con đã xóa
      const deletedRepliesCount = await commentModel.deleteManyByParentId(commentId)
      await commentModel.deleteById(commentId)
      // Giảm totalComments của card: 1 (cho comment gốc) + số lượng comment con đã xóa
      await cardModel.decrementTotalComments(targetComment.cardId, 1 + deletedRepliesCount)
    }

    return { resultMessage: 'Xóa bình luận thành công!' }
  } catch (error) {
    throw error
  }
}

export const commentService = {
  createNew,
  getComments,
  getReplies,
  updateComment,
  deleteComment
}
