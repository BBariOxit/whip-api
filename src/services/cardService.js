import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'
import { activityModel } from '~/models/activityModel'
import { labelModel } from '~/models/labelModel'
import { userModel } from '~/models/userModel'
import { CARD_MEMBER_ACTIONS, ACTIVITY_ACTION_TYPES } from '~/utils/constants'

// Helper: Ghi log activity vào DB (không throw error nếu fail để không block luồng chính)
const logActivity = async (data) => {
  try {
    await activityModel.createNew(data)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to log activity:', error)
  }
}

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // cập nhập lại mảng cardOrderIds trong collection column
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    // Lookup user từ DB để lấy displayName (JWT token chỉ chứa _id và email)
    const fullUser = await userModel.findOneById(userInfo._id)

    let updatedCard = {}
    if (cardCoverFile) {
      const uploadResult = await cloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })

      // Log: Thay đổi ảnh bìa
      await logActivity({
        cardId: cardId,
        userId: userInfo._id,
        userEmail: userInfo.email,
        userAvatar: userInfo.avatar || null,
        userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
        actionType: ACTIVITY_ACTION_TYPES.UPDATE_COVER,
        content: 'đã thay đổi ảnh bìa'
      })

    } else if (updateData.incomingMemberInfo) {
      // trường hợp ADD/REMOVE cardMemberInfo
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)

      // Log: Thêm/xóa thành viên
      const isAdd = updateData.incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD
      await logActivity({
        cardId: cardId,
        userId: userInfo._id,
        userEmail: userInfo.email,
        userAvatar: userInfo.avatar || null,
        userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
        actionType: isAdd ? ACTIVITY_ACTION_TYPES.ADD_MEMBER : ACTIVITY_ACTION_TYPES.REMOVE_MEMBER,
        content: isAdd ? 'đã tham gia thẻ này' : 'đã rời khỏi thẻ này'
      })

    } else {
      // các trường hợp update chung như title, description, due date...

      // Lấy card hiện tại TRƯỚC khi update (để so sánh labelIds cũ vs mới)
      let cardBeforeUpdate = null
      if (updateData.labelIds !== undefined) {
        cardBeforeUpdate = await cardModel.findOneById(cardId)
      }

      updatedCard = await cardModel.update(cardId, updateData)

      // Log: Tick/bỏ tick hoàn thành ngày hạn
      if (updateData.dueComplete !== undefined) {
        const actionText = updateData.dueComplete
          ? 'đã đánh dấu hoàn thành'
          : 'đã bỏ đánh dấu hoàn thành'
        await logActivity({
          cardId: cardId,
          userId: userInfo._id,
          userEmail: userInfo.email,
          userAvatar: userInfo.avatar || null,
          userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
          actionType: ACTIVITY_ACTION_TYPES.UPDATE_DATE,
          content: actionText
        })
      }

      // Log: Đặt/xóa ngày hạn
      if (updateData.dueDate !== undefined) {
        const actionText = updateData.dueDate
          ? 'đã cập nhật deadline'
          : 'đã gỡ deadline'
        await logActivity({
          cardId: cardId,
          userId: userInfo._id,
          userEmail: userInfo.email,
          userAvatar: userInfo.avatar || null,
          userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
          actionType: ACTIVITY_ACTION_TYPES.SET_DATE,
          content: actionText,
          metadata: updateData.dueDate ? { newDate: updateData.dueDate } : null
        })
      }

      // Log: Thêm/xóa nhãn (so sánh card TRƯỚC update vs SAU update)
      if (updateData.labelIds !== undefined && cardBeforeUpdate) {
        const oldLabelIds = (cardBeforeUpdate?.labelIds || []).map(id => id.toString())
        const newLabelIds = (updatedCard?.labelIds || []).map(id => id.toString())

        // Tìm label mới được thêm
        const addedLabelIds = newLabelIds.filter(id => !oldLabelIds.includes(id))
        // Tìm label bị xóa
        const removedLabelIds = oldLabelIds.filter(id => !newLabelIds.includes(id))

        // Ghi log cho từng label được thêm (kèm tên label)
        for (const labelId of addedLabelIds) {
          const label = await labelModel.findOneById(labelId)
          const labelName = label?.title || 'không tên'
          await logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
            actionType: ACTIVITY_ACTION_TYPES.ADD_LABEL,
            content: `đã thêm nhãn "${labelName}"`
          })
        }

        // Ghi log cho từng label bị xóa (kèm tên label)
        for (const labelId of removedLabelIds) {
          const label = await labelModel.findOneById(labelId)
          const labelName = label?.title || 'không tên'
          await logActivity({
            cardId: cardId,
            userId: userInfo._id,
            userEmail: userInfo.email,
            userAvatar: userInfo.avatar || null,
            userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
            actionType: ACTIVITY_ACTION_TYPES.REMOVE_LABEL,
            content: `đã xóa nhãn "${labelName}"`
          })
        }
      }
    }

    return updatedCard
  } catch (error) { throw error }
}

const uploadAttachment = async (cardId, file, userInfo) => {
  try {
    // Lookup user từ DB để lấy displayName
    const fullUser = await userModel.findOneById(userInfo._id)

    // Upload file lên Cloudinary với resource_type auto (Cloudinary tự nhận diện ảnh hay raw)
    const uploadResult = await cloudinaryProvider.streamUpload(file.buffer, 'card-attachments')

    // Lấy format từ originalname (vì Cloudinary với raw file không trả về format)
    const originalFormat = file.originalname.split('.').pop().toLowerCase()

    // Tạo object attachment metadata
    const attachment = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      filename: file.originalname,
      format: uploadResult.format || originalFormat,
      createdAt: Date.now()
    }

    // Push attachment vào mảng attachments của card
    const updatedCard = await cardModel.pushNewAttachment(cardId, attachment)

    // Log activity
    await logActivity({
      cardId: cardId,
      userId: userInfo._id,
      userEmail: userInfo.email,
      userAvatar: userInfo.avatar || null,
      userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
      actionType: ACTIVITY_ACTION_TYPES.ADD_ATTACHMENT,
      content: `đã đính kèm "${file.originalname}"`
    })

    return updatedCard
  } catch (error) { throw error }
}

const deleteAttachment = async (cardId, publicId, userInfo) => {
  try {
    const fullUser = await userModel.findOneById(userInfo._id)

    // Tìm card hiện tại để lấy filename (cho log activity)
    const currentCard = await cardModel.findOneById(cardId)
    const attachment = currentCard?.attachments?.find(att => att.publicId === publicId)
    const filename = attachment?.filename || 'file'

    // Xóa file vật lý trên Cloudinary
    await cloudinaryProvider.deleteResource(publicId)

    // Xóa attachment khỏi mảng trong DB
    const updatedCard = await cardModel.pullAttachment(cardId, publicId)

    // Log activity
    await logActivity({
      cardId: cardId,
      userId: userInfo._id,
      userEmail: userInfo.email,
      userAvatar: userInfo.avatar || null,
      userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
      actionType: ACTIVITY_ACTION_TYPES.REMOVE_ATTACHMENT,
      content: `đã xóa file đính kèm "${filename}"`
    })

    return updatedCard
  } catch (error) { throw error }
}

const deleteItem = async (cardId, userInfo) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new Error('Card not found!')
    }

    // Xóa card khỏi db
    await cardModel.deleteOneById(cardId)

    // Xóa cardId khỏi mảng cardOrderIds của Column chứa nó
    await columnModel.pullCardOrderIds(targetCard)

    // Log activity
    const fullUser = await userModel.findOneById(userInfo._id)
    await logActivity({
      cardId: cardId, // Có thể log ở cấp độ board nếu cardId đã mất
      userId: userInfo._id,
      userEmail: userInfo.email,
      userAvatar: userInfo.avatar || null,
      userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
      actionType: 'DELETE_CARD',
      content: `đã xóa một thẻ "${targetCard.title}"`
    })

    return { deleteResult: 'Card deleted successfully!' }
  } catch (error) {
    throw error
  }
}

const archiveCard = async (cardId, userInfo) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new Error('Card not found!')
    }

    // Archive card (soft delete)
    await cardModel.archiveCard(cardId)

    // Xóa cardId khỏi mảng cardOrderIds của Column chứa nó
    await columnModel.pullCardOrderIds(targetCard)

    // Log activity (bỏ qua log khi archive)
    // const fullUser = await userModel.findOneById(userInfo._id)
    // await logActivity({
    //   cardId: cardId,
    //   userId: userInfo._id,
    //   userEmail: userInfo.email,
    //   userAvatar: userInfo.avatar || null,
    //   userDisplayName: fullUser?.displayName || fullUser?.username || userInfo.email,
    //   actionType: ACTIVITY_ACTION_TYPES.ARCHIVE_CARD,
    //   content: `đã lưu trữ thẻ "${targetCard.title}"`
    // })

    return { archiveResult: 'Card archived successfully!' }
  } catch (error) {
    throw error
  }
}

const restoreCard = async (cardId, newColumnId) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new Error('Card not found!')
    }

    // Restore card (unset _destroy)
    const restoredCard = await cardModel.restoreCard(cardId, newColumnId)

    // Thêm lại cardId vào mảng cardOrderIds của Column chứa nó (hoặc cột mới nếu có)
    const pushData = {
      _id: restoredCard._id,
      columnId: restoredCard.columnId
    }
    await columnModel.pushCardOrderIds(pushData)

    return restoredCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update,
  uploadAttachment,
  deleteAttachment,
  deleteItem,
  archiveCard,
  restoreCard
}
