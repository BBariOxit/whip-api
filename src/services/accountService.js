import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { GET_CLIENT, GET_DB } from '~/config/mongodb'
import { WORKSPACE_ROLES } from '~/utils/constants'
import { pickUser } from '~/utils/formatter'
import { brevoProvider } from '~/providers/brevoProvider'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'
import { userModel } from '~/models/userModel'
import { workspaceModel } from '~/models/workspaceModel'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { labelModel } from '~/models/labelModel'
import { commentModel } from '~/models/commentModel'
import { activityModel } from '~/models/activityModel'
import { invitationModel } from '~/models/invitationModel'
import { notificationModel } from '~/models/notificationModel'
import { workspaceActivityModel } from '~/models/workspaceActivityModel'
import { boardService } from '~/services/boardService'

const ACCOUNT_DELETION_TOKEN_TTL_MS = 15 * 60 * 1000
const DELETED_USER_NAME = 'Deleted user'

const matchesId = (candidate, expected) => candidate?.toString() === expected.toString()
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
const createVerificationCode = () => crypto.randomInt(0, 1000000).toString().padStart(6, '0')

const requireActiveUser = async (userId) => {
  const user = await userModel.findOneById(userId)
  if (!user || !user.isActive) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
  return user
}

const exportAccountData = async (userId) => {
  const user = await requireActiveUser(userId)
  const db = GET_DB()
  const userObjectId = new ObjectId(userId)

  const [
    workspaceDocuments,
    boardDocuments,
    comments,
    activities,
    invitations,
    notifications,
    workspaceActivities
  ] = await Promise.all([
    db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
      .find(
        { members: { $elemMatch: { userId: userObjectId } } },
        { projection: { title: 1, members: 1, createdAt: 1, updatedAt: 1 } }
      )
      .toArray(),
    db.collection(boardModel.BOARD_COLLECTION_NAME)
      .find(
        {
          _destroy: false,
          $or: [
            { ownerIds: userObjectId },
            { memberIds: userObjectId },
            { starredBy: userObjectId }
          ]
        },
        {
          projection: {
            title: 1,
            description: 1,
            type: 1,
            workspaceId: 1,
            ownerIds: 1,
            memberIds: 1,
            starredBy: 1,
            createAt: 1,
            createdAt: 1,
            updateAt: 1,
            updatedAt: 1
          }
        }
      )
      .toArray(),
    db.collection(commentModel.COMMENT_COLLECTION_NAME)
      .find(
        { userId: userObjectId },
        {
          projection: {
            userId: 0,
            userEmail: 0,
            userAvatar: 0,
            userDisplayName: 0,
            _destroy: 0
          }
        }
      )
      .sort({ createdAt: 1 })
      .toArray(),
    db.collection(activityModel.ACTIVITY_COLLECTION_NAME)
      .find(
        { userId: userObjectId },
        {
          projection: {
            userId: 0,
            userEmail: 0,
            userAvatar: 0,
            userDisplayName: 0
          }
        }
      )
      .sort({ createdAt: 1 })
      .toArray(),
    db.collection(invitationModel.INVITATION_COLLECTION_NAME)
      .find({ $or: [{ inviterId: userObjectId }, { inviteeId: userObjectId }] })
      .sort({ createdAt: 1 })
      .toArray(),
    db.collection(notificationModel.NOTIFICATION_COLLECTION_NAME)
      .find(
        { userId: userObjectId },
        { projection: { userId: 0, actorId: 0, expireAt: 0, _destroy: 0 } }
      )
      .sort({ createdAt: 1 })
      .toArray(),
    db.collection(workspaceActivityModel.WORKSPACE_ACTIVITY_COLLECTION_NAME)
      .find(
        { actorId: userObjectId },
        { projection: { actorId: 0, actorName: 0, actorAvatar: 0, expireAt: 0 } }
      )
      .sort({ createdAt: 1 })
      .toArray()
  ])

  const workspaces = workspaceDocuments.map((workspace) => {
    const membership = workspace.members?.find(member => matchesId(member.userId, userObjectId))
    return {
      _id: workspace._id,
      title: workspace.title,
      role: membership?.role,
      status: membership?.status,
      joinedAt: membership?.joinedAt,
      notificationPreferences: membership?.notificationPrefs || {},
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    }
  })

  const boards = boardDocuments.map((board) => ({
    _id: board._id,
    title: board.title,
    description: board.description,
    type: board.type,
    workspaceId: board.workspaceId,
    access: {
      owner: board.ownerIds?.some(id => matchesId(id, userObjectId)) || false,
      member: board.memberIds?.some(id => matchesId(id, userObjectId)) || false,
      starred: board.starredBy?.some(id => matchesId(id, userObjectId)) || false
    },
    createdAt: board.createdAt || board.createAt,
    updatedAt: board.updatedAt || board.updateAt
  }))

  const sanitizedInvitations = invitations.map((invitation) => ({
    _id: invitation._id,
    direction: matchesId(invitation.inviterId, userObjectId) ? 'sent' : 'received',
    type: invitation.type,
    boardInvitation: invitation.boardInvitation,
    workspaceInvitation: invitation.workspaceInvitation,
    status: invitation.status,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt
  }))

  return {
    schemaVersion: 1,
    kind: 'account-data',
    exportedAt: new Date().toISOString(),
    profile: pickUser(user),
    workspaces,
    boards,
    authoredComments: comments,
    accountActivities: activities,
    invitations: sanitizedInvitations,
    notifications,
    workspaceActivities,
    counts: {
      workspaces: workspaces.length,
      boards: boards.length,
      authoredComments: comments.length,
      accountActivities: activities.length,
      invitations: sanitizedInvitations.length,
      notifications: notifications.length,
      workspaceActivities: workspaceActivities.length
    }
  }
}

const exportPersonalBoards = async (userId) => {
  await requireActiveUser(userId)
  const userObjectId = new ObjectId(userId)
  const personalBoards = await GET_DB().collection(boardModel.BOARD_COLLECTION_NAME)
    .find({
      workspaceId: null,
      ownerIds: userObjectId,
      _destroy: false,
      isTemplate: { $ne: true }
    })
    .sort({ createdAt: 1, createAt: 1 })
    .project({ _id: 1 })
    .toArray()

  // Export sequentially to avoid opening many large aggregation queries at once.
  const boards = []
  for (const board of personalBoards) {
    const exportedBoard = await boardService.exportData(userId, board._id.toString())
    boards.push(exportedBoard)
  }

  return {
    schemaVersion: 1,
    kind: 'personal-boards',
    exportedAt: new Date().toISOString(),
    count: boards.length,
    boards
  }
}

const requestAccountDeletion = async (userId) => {
  const user = await requireActiveUser(userId)
  const verificationCode = createVerificationCode()
  const tokenHash = hashToken(verificationCode)
  const expiresAt = Date.now() + ACCOUNT_DELETION_TOKEN_TTL_MS

  await userModel.saveAccountDeletionToken(userId, tokenHash, expiresAt)

  try {
    await brevoProvider.sendEmail(
      user.email,
      'Confirm deletion of your Whip account',
      `
        <h3>Confirm account deletion</h3>
        <p>Enter this one-time code in Whip to permanently delete your account:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${verificationCode}</p>
        <p>This code expires in 15 minutes. If you did not request this, change your password and ignore this email.</p>
      `
    )
  } catch (error) {
    await userModel.saveAccountDeletionToken(userId, null, null)
    throw error
  }

  return {
    message: 'A verification code was sent to your account email.',
    expiresInMinutes: ACCOUNT_DELETION_TOKEN_TTL_MS / 60000
  }
}

const getWorkspaceOwnershipBlockers = async (db, userObjectId, session) => {
  return await db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
    .find(
      {
        _destroy: false,
        members: {
          $elemMatch: {
            userId: userObjectId,
            role: WORKSPACE_ROLES.OWNER,
            status: 'active'
          }
        }
      },
      { session, projection: { title: 1 } }
    )
    .toArray()
}

const deleteBoardsAndChildren = async ({ db, boardIds, session, attachmentPublicIds }) => {
  if (boardIds.length === 0) return

  const cards = await db.collection(cardModel.CARD_COLLECTION_NAME)
    .find(
      { boardId: { $in: boardIds } },
      { session, projection: { _id: 1, attachments: 1 } }
    )
    .toArray()
  const cardIds = cards.map(card => card._id)

  for (const card of cards) {
    for (const attachment of (card.attachments || [])) {
      if (attachment.publicId) attachmentPublicIds.add(attachment.publicId)
    }
  }

  if (cardIds.length > 0) {
    await db.collection(commentModel.COMMENT_COLLECTION_NAME).deleteMany({ cardId: { $in: cardIds } }, { session })
    await db.collection(activityModel.ACTIVITY_COLLECTION_NAME).deleteMany({ cardId: { $in: cardIds } }, { session })
  }

  // MongoDB does not support parallel operations on one transaction session.
  await db.collection(columnModel.COLUMN_COLLECTION_NAME).deleteMany({ boardId: { $in: boardIds } }, { session })
  await db.collection(cardModel.CARD_COLLECTION_NAME).deleteMany({ boardId: { $in: boardIds } }, { session })
  await db.collection(labelModel.LABEL_COLLECTION_NAME).deleteMany({ boardId: { $in: boardIds } }, { session })
  await db.collection(notificationModel.NOTIFICATION_COLLECTION_NAME).deleteMany({ boardId: { $in: boardIds } }, { session })
  await db.collection(boardModel.BOARD_COLLECTION_NAME).deleteMany({ _id: { $in: boardIds } }, { session })
}

const removeUserFromCollaborativeData = async ({ db, user, userObjectId, session }) => {
  const workspaces = await db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
    .find(
      { members: { $elemMatch: { userId: userObjectId } } },
      { session, projection: { members: 1 } }
    )
    .toArray()

  for (const workspace of workspaces) {
    const workspaceOwner = workspace.members?.find(member => (
      member.role === WORKSPACE_ROLES.OWNER &&
      member.status === 'active' &&
      member.userId &&
      !matchesId(member.userId, userObjectId)
    ))

    if (workspaceOwner?.userId) {
      // Preserve workspace boards owned by the departing user by assigning the workspace owner first.
      await db.collection(boardModel.BOARD_COLLECTION_NAME).updateMany(
        { workspaceId: workspace._id, ownerIds: userObjectId },
        { $addToSet: { ownerIds: workspaceOwner.userId, memberIds: workspaceOwner.userId } },
        { session }
      )
    }
  }

  await db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME).updateMany(
    {},
    { $pull: { members: { userId: userObjectId } } },
    { session }
  )
  await db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME).updateMany(
    {},
    { $pull: { members: { userId: null, email: user.email } } },
    { session }
  )
  await db.collection(boardModel.BOARD_COLLECTION_NAME).updateMany(
    {},
    {
      $pull: {
        ownerIds: userObjectId,
        memberIds: userObjectId,
        starredBy: userObjectId
      }
    },
    { session }
  )
  await db.collection(cardModel.CARD_COLLECTION_NAME).updateMany(
    { memberIds: userObjectId },
    { $pull: { memberIds: userObjectId } },
    { session }
  )
}

const anonymizeAuthoredContent = async ({ db, user, userObjectId, session }) => {
  const authoredComments = await db.collection(commentModel.COMMENT_COLLECTION_NAME)
    .find(
      { userId: userObjectId },
      { session, projection: { _id: 1, parentId: 1 } }
    )
    .toArray()
  const authoredCommentIds = authoredComments.map(comment => comment._id)

  await db.collection(commentModel.COMMENT_COLLECTION_NAME).updateMany(
    { userId: userObjectId },
    {
      $set: {
        userId: null,
        userEmail: '',
        userAvatar: null,
        userDisplayName: DELETED_USER_NAME
      }
    },
    { session }
  )
  await db.collection(activityModel.ACTIVITY_COLLECTION_NAME).updateMany(
    { userId: userObjectId },
    {
      $set: {
        userId: null,
        userEmail: '',
        userAvatar: null,
        userDisplayName: DELETED_USER_NAME
      }
    },
    { session }
  )
  await db.collection(workspaceActivityModel.WORKSPACE_ACTIVITY_COLLECTION_NAME).updateMany(
    { actorId: userObjectId },
    { $set: { actorId: null, actorName: DELETED_USER_NAME, actorAvatar: null } },
    { session }
  )
  await db.collection(workspaceActivityModel.WORKSPACE_ACTIVITY_COLLECTION_NAME).updateMany(
    { targetName: user.email },
    { $set: { targetName: DELETED_USER_NAME } },
    { session }
  )
  await db.collection(notificationModel.NOTIFICATION_COLLECTION_NAME).updateMany(
    { actorId: userObjectId },
    {
      $set: {
        actorId: null,
        message: 'An account that has since been deleted performed this action.'
      }
    },
    { session }
  )

  if (authoredCommentIds.length > 0) {
    await db.collection(commentModel.COMMENT_COLLECTION_NAME).updateMany(
      {
        parentId: { $in: authoredCommentIds },
        replyToUserDisplayName: user.displayName
      },
      { $set: { replyToUserDisplayName: DELETED_USER_NAME } },
      { session }
    )
  }
}

const deleteAccount = async (userId, { confirmation_email: confirmationEmail, verification_code: verificationCode }) => {
  const user = await requireActiveUser(userId)
  if (confirmationEmail !== user.email.toLowerCase()) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Confirmation email does not match your account email')
  }

  const tokenHash = hashToken(verificationCode)
  const verifiedUser = await userModel.findOneByAccountDeletionToken(userId, tokenHash)
  if (!verifiedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Verification code is invalid or expired')
  }

  const client = GET_CLIENT()
  const db = GET_DB()
  const session = client.startSession()
  const userObjectId = new ObjectId(userId)
  const attachmentPublicIds = new Set()
  const avatarPublicId = cloudinaryProvider.getPublicIdFromUrl(user.avatar)
  let deletedBoardCount = 0

  try {
    await session.withTransaction(async () => {
      const blockers = await getWorkspaceOwnershipBlockers(db, userObjectId, session)
      if (blockers.length > 0) {
        const names = blockers.map(workspace => workspace.title).join(', ')
        throw new ApiError(
          StatusCodes.CONFLICT,
          `Transfer ownership or delete these workspaces before deleting your account: ${names}`
        )
      }

      const personalOwnedBoards = await db.collection(boardModel.BOARD_COLLECTION_NAME)
        .find(
          { workspaceId: null, ownerIds: userObjectId, _destroy: false },
          { session, projection: { ownerIds: 1 } }
        )
        .toArray()
      const boardIdsToDelete = personalOwnedBoards
        .filter(board => (board.ownerIds || []).filter(ownerId => !matchesId(ownerId, userObjectId)).length === 0)
        .map(board => board._id)
      deletedBoardCount = boardIdsToDelete.length

      await deleteBoardsAndChildren({
        db,
        boardIds: boardIdsToDelete,
        session,
        attachmentPublicIds
      })
      await removeUserFromCollaborativeData({ db, user, userObjectId, session })
      await anonymizeAuthoredContent({ db, user, userObjectId, session })

      await db.collection(invitationModel.INVITATION_COLLECTION_NAME).deleteMany(
        { $or: [{ inviterId: userObjectId }, { inviteeId: userObjectId }] },
        { session }
      )
      await db.collection(notificationModel.NOTIFICATION_COLLECTION_NAME).deleteMany(
        { userId: userObjectId },
        { session }
      )

      const deletedUser = await db.collection(userModel.USER_COLLECTION_NAME).deleteOne(
        {
          _id: userObjectId,
          accountDeletionTokenHash: tokenHash,
          accountDeletionExpiresAt: { $gt: Date.now() }
        },
        { session }
      )
      if (deletedUser.deletedCount !== 1) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Verification code is invalid or expired')
      }
    })
  } finally {
    await session.endSession()
  }

  const cloudinaryIds = [...attachmentPublicIds]
  if (avatarPublicId) cloudinaryIds.push(avatarPublicId)
  await Promise.allSettled(cloudinaryIds.map(publicId => cloudinaryProvider.deleteResource(publicId)))

  return {
    accountDeleted: true,
    deletedPersonalBoards: deletedBoardCount
  }
}

const initIndexes = async () => {
  const db = GET_DB()
  await Promise.all([
    db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME).createIndex({ 'members.userId': 1 }),
    db.collection(boardModel.BOARD_COLLECTION_NAME).createIndex({ ownerIds: 1 }),
    db.collection(boardModel.BOARD_COLLECTION_NAME).createIndex({ memberIds: 1 }),
    db.collection(boardModel.BOARD_COLLECTION_NAME).createIndex({ starredBy: 1 }),
    db.collection(cardModel.CARD_COLLECTION_NAME).createIndex({ memberIds: 1 }),
    db.collection(commentModel.COMMENT_COLLECTION_NAME).createIndex({ userId: 1 }),
    db.collection(activityModel.ACTIVITY_COLLECTION_NAME).createIndex({ userId: 1 }),
    db.collection(invitationModel.INVITATION_COLLECTION_NAME).createIndex({ inviterId: 1 }),
    db.collection(invitationModel.INVITATION_COLLECTION_NAME).createIndex({ inviteeId: 1 }),
    db.collection(workspaceActivityModel.WORKSPACE_ACTIVITY_COLLECTION_NAME).createIndex({ actorId: 1 })
  ])
}

export const accountService = {
  exportAccountData,
  exportPersonalBoards,
  requestAccountDeletion,
  deleteAccount,
  initIndexes
}
