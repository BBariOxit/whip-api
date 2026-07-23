import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatter'
import { getBoardAccessRole } from '~/middlewares/rbacMiddleware'
import { GET_CLIENT, GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { INVITATION_TTL_DAYS } from '~/utils/constants'

const INVITATION_TTL_MS = INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: chính là người đang request, nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)

    // Người được mời: lấy theo email nhận từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)

    // Tìm luôn cái board ra để lấy data xử lý
    const board = await boardModel.findOneById(reqBody.boardId)

    // Nếu không tồn tại 1 trong 3 thì cứ thẳng tay reject
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    const inviterBoardRole = await getBoardAccessRole(board, inviterId)
    if (!['admin', 'member'].includes(inviterBoardRole)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to invite users to this board!')
    }

    if (invitee._id.toString() === inviterId.toString()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot invite yourself to a board!')
    }

    const existingBoardUserIds = [...(board.ownerIds || []), ...(board.memberIds || [])]
      .map(id => id.toString())
    if (existingBoardUserIds.includes(invitee._id.toString())) {
      throw new ApiError(StatusCodes.CONFLICT, 'This user is already a member of the board!')
    }

    const existingPendingInvitation = await invitationModel.findPendingBoardInvitation(
      board._id.toString(),
      invitee._id.toString()
    )
    if (existingPendingInvitation) {
      throw new ApiError(StatusCodes.CONFLICT, 'A pending invitation already exists for this user!')
    }

    // Tạo data cần thiết để lưu vào trong DB
    // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status để test xem Model validate ok chưa.
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      },
      expiresAt: Date.now() + INVITATION_TTL_MS
    }

    // Gọi sang Model để lưu vào DB
    let createdInvitation
    try {
      createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    } catch (error) {
      if (error?.code === 11000) {
        throw new ApiError(StatusCodes.CONFLICT, 'A pending invitation already exists for this user!')
      }
      throw error
    }

    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE thoải mái xử lý.
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    await invitationModel.expirePendingBoardInvitations({ inviteeId: new ObjectId(userId) })
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log('service: ', getInvitations)

    // Vì các dữ liệu inviter, invitee và board là đang ở giá trị mảng 1 phần tử nếu lấy
    // ra được nên chúng ta biến đổi nó về Json Object trước khi trả về
    const resInvitations = getInvitations.map(inv => ({
      ...inv,
      inviter: inv.inviter[0] || {},
      invitee: inv.invitee[0] || {},
      board: inv.board[0] || {}
    }))

    return resInvitations
  } catch (error) {
    throw error
  }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // Tìm bản ghi invitation trong model
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

    if (getInvitation.inviteeId?.toString() !== userId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'This invitation is not addressed to your account!')
    }
    if (getInvitation.boardInvitation?.status !== BOARD_INVITATION_STATUS.PENDING) {
      throw new ApiError(StatusCodes.CONFLICT, 'This invitation has already been processed!')
    }
    if (new Date(getInvitation.expiresAt).getTime() <= Date.now()) {
      await invitationModel.transitionBoardInvitation({
        invitationId,
        expectedStatuses: [BOARD_INVITATION_STATUS.PENDING],
        nextStatus: BOARD_INVITATION_STATUS.EXPIRED,
        actorFilter: { inviteeId: new ObjectId(userId) }
      })
      throw new ApiError(StatusCodes.GONE, 'This invitation has expired!')
    }

    // Sau khi có Invitation rồi thì lấy full thông tin của board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    // Kiểm tra xem nếu status là ACCEPTED join board mà cái thằng user (invitee) đã
    // là owner hoặc member của board rồi thì trả về thông báo lỗi luôn.
    // Note: 2 mảng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId
    // nên cho nó về String hết luôn để check
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds]
      .map(id => id.toString())
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId.toString())) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You already a member of this board!')
    }

    const client = GET_CLIENT()
    const session = client.startSession()
    let updatedInvitation = null
    try {
      await session.withTransaction(async () => {
        updatedInvitation = await invitationModel.transitionBoardInvitation({
          invitationId,
          expectedStatuses: [BOARD_INVITATION_STATUS.PENDING],
          nextStatus: status,
          actorFilter: {
            inviteeId: new ObjectId(userId),
            expiresAt: { $gt: new Date() }
          },
          session
        })
        if (!updatedInvitation) {
          throw new ApiError(StatusCodes.CONFLICT, 'Invitation status changed. Please refresh and try again.')
        }

        if (status === BOARD_INVITATION_STATUS.ACCEPTED) {
          await GET_DB().collection(boardModel.BOARD_COLLECTION_NAME).updateOne(
            { _id: new ObjectId(boardId) },
            { $addToSet: { memberIds: new ObjectId(userId) } },
            { session }
          )
        }
      })
    } finally {
      await session.endSession()
    }

    return updatedInvitation

  } catch (error) {
    throw error
  }
}

const getBoardInvitations = async (boardId) => {
  return await invitationModel.findByBoard(boardId)
}

const cancelBoardInvitation = async (userId, invitationId) => {
  await invitationModel.expirePendingBoardInvitations({ _id: new ObjectId(invitationId) })
  const invitation = await invitationModel.findOneById(invitationId)
  if (!invitation?.boardInvitation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')
  }
  const board = await boardModel.findOneById(invitation.boardInvitation.boardId)
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

  const role = await getBoardAccessRole(board, userId)
  if (!['admin', 'member'].includes(role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to cancel this invitation!')
  }

  const updatedInvitation = await invitationModel.transitionBoardInvitation({
    invitationId,
    expectedStatuses: [BOARD_INVITATION_STATUS.PENDING],
    nextStatus: BOARD_INVITATION_STATUS.CANCELLED
  })
  if (!updatedInvitation) {
    throw new ApiError(StatusCodes.CONFLICT, 'Only pending invitations can be cancelled!')
  }
  return updatedInvitation
}

const resendBoardInvitation = async (userId, invitationId) => {
  await invitationModel.expirePendingBoardInvitations({ _id: new ObjectId(invitationId) })
  const invitation = await invitationModel.findOneById(invitationId)
  if (!invitation?.boardInvitation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')
  }
  const board = await boardModel.findOneById(invitation.boardInvitation.boardId)
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

  const role = await getBoardAccessRole(board, userId)
  if (!['admin', 'member'].includes(role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to resend this invitation!')
  }

  const inviteeId = invitation.inviteeId.toString()
  const boardUserIds = [...(board.ownerIds || []), ...(board.memberIds || [])]
    .map(id => id.toString())
  if (boardUserIds.includes(inviteeId)) {
    throw new ApiError(StatusCodes.CONFLICT, 'This user is already a member of the board!')
  }

  const updatedInvitation = await invitationModel.transitionBoardInvitation({
    invitationId,
    expectedStatuses: [
      BOARD_INVITATION_STATUS.REJECTED,
      BOARD_INVITATION_STATUS.CANCELLED,
      BOARD_INVITATION_STATUS.EXPIRED
    ],
    nextStatus: BOARD_INVITATION_STATUS.PENDING,
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS)
  })
  if (!updatedInvitation) {
    throw new ApiError(StatusCodes.CONFLICT, 'This invitation cannot be resent in its current state!')
  }

  const invitee = await userModel.findOneById(inviteeId)
  return {
    ...updatedInvitation,
    board,
    invitee: pickUser(invitee)
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation,
  getBoardInvitations,
  cancelBoardInvitation,
  resendBoardInvitation
}
