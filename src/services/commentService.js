import { commentModel } from '~/models/commentModel'
import { userModel } from '~/models/userModel'

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

export const commentService = {
  createNew,
  getComments,
  getReplies
}
