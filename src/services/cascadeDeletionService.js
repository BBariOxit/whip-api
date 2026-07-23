import { ObjectId } from 'mongodb'
import { GET_CLIENT, GET_DB } from '~/config/mongodb'
import { activityModel } from '~/models/activityModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { commentModel } from '~/models/commentModel'
import { invitationModel } from '~/models/invitationModel'
import { labelModel } from '~/models/labelModel'
import { notificationModel } from '~/models/notificationModel'
import { userModel } from '~/models/userModel'
import { workspaceActivityModel } from '~/models/workspaceActivityModel'
import { workspaceModel } from '~/models/workspaceModel'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'

const createAssetRegistry = () => new Map()

const registerAsset = (registry, publicId, url = null) => {
  if (!publicId) return
  const urls = registry.get(publicId) || new Set()
  if (url) urls.add(url)
  registry.set(publicId, urls)
}

const registerUrl = (registry, url) => {
  const publicId = cloudinaryProvider.getPublicIdFromUrl(url)
  registerAsset(registry, publicId, url)
}

const collectCardAssets = (registry, cards) => {
  for (const card of cards) {
    registerUrl(registry, card.cover)
    for (const attachment of (card.attachments || [])) {
      registerAsset(registry, attachment.publicId, attachment.url)
    }
  }
}

const collectBoardAssets = (registry, boards) => {
  for (const board of boards) registerUrl(registry, board.background?.image)
}

const isAssetStillReferenced = async (publicId, urls) => {
  const db = GET_DB()
  const urlList = [...urls]
  const cardConditions = [{ 'attachments.publicId': publicId }]
  if (urlList.length) cardConditions.push({ cover: { $in: urlList } })

  const lookups = [
    db.collection(cardModel.CARD_COLLECTION_NAME).findOne(
      { $or: cardConditions },
      { projection: { _id: 1 } }
    )
  ]

  if (urlList.length) {
    lookups.push(
      db.collection(boardModel.BOARD_COLLECTION_NAME).findOne(
        { 'background.image': { $in: urlList } },
        { projection: { _id: 1 } }
      ),
      db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME).findOne(
        { logo: { $in: urlList } },
        { projection: { _id: 1 } }
      ),
      db.collection(userModel.USER_COLLECTION_NAME).findOne(
        { avatar: { $in: urlList } },
        { projection: { _id: 1 } }
      )
    )
  }

  return (await Promise.all(lookups)).some(Boolean)
}

const cleanupAssets = async (registry) => {
  const results = []
  for (const [publicId, urls] of registry.entries()) {
    try {
      if (await isAssetStillReferenced(publicId, urls)) {
        results.push({ publicId, status: 'retained' })
        continue
      }
      await cloudinaryProvider.deleteResource(publicId)
      results.push({ publicId, status: 'deleted' })
    } catch (error) {
      // Database deletion is already committed. Keep cleanup best-effort and
      // return failures so callers can send them to operational monitoring.
      results.push({ publicId, status: 'failed', reason: error.message })
    }
  }
  return results
}

const deleteCardsByIds = async ({ db, cardIds, session, assets, cards = null }) => {
  if (!cardIds.length) return
  const targetCards = cards || await db.collection(cardModel.CARD_COLLECTION_NAME)
    .find({ _id: { $in: cardIds } }, { session })
    .toArray()
  collectCardAssets(assets, targetCards)

  await db.collection(commentModel.COMMENT_COLLECTION_NAME)
    .deleteMany({ cardId: { $in: cardIds } }, { session })
  await db.collection(activityModel.ACTIVITY_COLLECTION_NAME)
    .deleteMany({ cardId: { $in: cardIds } }, { session })
  await db.collection(cardModel.CARD_COLLECTION_NAME)
    .deleteMany({ _id: { $in: cardIds } }, { session })
}

const deleteBoardsByIds = async ({ db, boardIds, session, assets, boards = null }) => {
  if (!boardIds.length) return
  const targetBoards = boards || await db.collection(boardModel.BOARD_COLLECTION_NAME)
    .find({ _id: { $in: boardIds } }, { session })
    .toArray()
  collectBoardAssets(assets, targetBoards)

  const cards = await db.collection(cardModel.CARD_COLLECTION_NAME)
    .find({ boardId: { $in: boardIds } }, { session })
    .toArray()
  await deleteCardsByIds({
    db,
    cardIds: cards.map(card => card._id),
    session,
    assets,
    cards
  })

  await db.collection(columnModel.COLUMN_COLLECTION_NAME)
    .deleteMany({ boardId: { $in: boardIds } }, { session })
  await db.collection(labelModel.LABEL_COLLECTION_NAME)
    .deleteMany({ boardId: { $in: boardIds } }, { session })
  await db.collection(notificationModel.NOTIFICATION_COLLECTION_NAME)
    .deleteMany({ boardId: { $in: boardIds } }, { session })
  await db.collection(invitationModel.INVITATION_COLLECTION_NAME)
    .deleteMany({ 'boardInvitation.boardId': { $in: boardIds } }, { session })
  await db.collection(boardModel.BOARD_COLLECTION_NAME)
    .deleteMany({ _id: { $in: boardIds } }, { session })
}

const runCascade = async (operation) => {
  const client = GET_CLIENT()
  const session = client.startSession()
  const assets = createAssetRegistry()
  let result

  try {
    await session.withTransaction(async () => {
      result = await operation({ db: GET_DB(), session, assets })
    })
  } finally {
    await session.endSession()
  }

  const assetCleanup = await cleanupAssets(assets)
  return { result, assetCleanup }
}

const deleteCard = async (cardId) => runCascade(async ({ db, session, assets }) => {
  const cardObjectId = new ObjectId(cardId)
  const card = await db.collection(cardModel.CARD_COLLECTION_NAME)
    .findOne({ _id: cardObjectId }, { session })
  if (!card) return null

  await deleteCardsByIds({ db, cardIds: [cardObjectId], session, assets, cards: [card] })
  await db.collection(columnModel.COLUMN_COLLECTION_NAME).updateOne(
    { _id: card.columnId },
    { $pull: { cardOrderIds: cardObjectId } },
    { session }
  )
  return card
})

const deleteColumn = async (columnId) => runCascade(async ({ db, session, assets }) => {
  const columnObjectId = new ObjectId(columnId)
  const column = await db.collection(columnModel.COLUMN_COLLECTION_NAME)
    .findOne({ _id: columnObjectId }, { session })
  if (!column) return null

  const cards = await db.collection(cardModel.CARD_COLLECTION_NAME)
    .find({ columnId: columnObjectId }, { session })
    .toArray()
  await deleteCardsByIds({
    db,
    cardIds: cards.map(card => card._id),
    session,
    assets,
    cards
  })
  await db.collection(columnModel.COLUMN_COLLECTION_NAME)
    .deleteOne({ _id: columnObjectId }, { session })
  await db.collection(boardModel.BOARD_COLLECTION_NAME).updateOne(
    { _id: column.boardId },
    { $pull: { columnOrderIds: columnObjectId } },
    { session }
  )
  return column
})

const clearColumnCards = async (columnId) => runCascade(async ({ db, session, assets }) => {
  const columnObjectId = new ObjectId(columnId)
  const column = await db.collection(columnModel.COLUMN_COLLECTION_NAME)
    .findOne({ _id: columnObjectId }, { session })
  if (!column) return null

  const cards = await db.collection(cardModel.CARD_COLLECTION_NAME)
    .find({ columnId: columnObjectId }, { session })
    .toArray()
  await deleteCardsByIds({
    db,
    cardIds: cards.map(card => card._id),
    session,
    assets,
    cards
  })
  await db.collection(columnModel.COLUMN_COLLECTION_NAME).updateOne(
    { _id: columnObjectId },
    { $set: { cardOrderIds: [], updatedAt: Date.now() } },
    { session }
  )
  return { column, deletedCardCount: cards.length }
})

const deleteBoards = async (boardIds) => runCascade(async ({ db, session, assets }) => {
  const objectIds = boardIds.map(id => new ObjectId(id))
  const boards = await db.collection(boardModel.BOARD_COLLECTION_NAME)
    .find({ _id: { $in: objectIds } }, { session })
    .toArray()
  await deleteBoardsByIds({
    db,
    boardIds: boards.map(board => board._id),
    session,
    assets,
    boards
  })
  return boards
})

const deleteWorkspace = async (workspaceId) => runCascade(async ({ db, session, assets }) => {
  const workspaceObjectId = new ObjectId(workspaceId)
  const workspace = await db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
    .findOne({ _id: workspaceObjectId }, { session })
  if (!workspace) return null

  registerUrl(assets, workspace.logo)
  const boards = await db.collection(boardModel.BOARD_COLLECTION_NAME)
    .find({ workspaceId: workspaceObjectId }, { session })
    .toArray()
  await deleteBoardsByIds({
    db,
    boardIds: boards.map(board => board._id),
    session,
    assets,
    boards
  })

  await db.collection(notificationModel.NOTIFICATION_COLLECTION_NAME)
    .deleteMany({ workspaceId: workspaceObjectId }, { session })
  await db.collection(workspaceActivityModel.WORKSPACE_ACTIVITY_COLLECTION_NAME)
    .deleteMany({ workspaceId: workspaceObjectId }, { session })
  await db.collection(invitationModel.INVITATION_COLLECTION_NAME)
    .deleteMany({ 'workspaceInvitation.workspaceId': workspaceObjectId }, { session })
  await db.collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
    .deleteOne({ _id: workspaceObjectId }, { session })
  return { workspace, deletedBoardCount: boards.length }
})

export const cascadeDeletionService = {
  deleteCard,
  deleteColumn,
  clearColumnCards,
  deleteBoards,
  deleteWorkspace
}
