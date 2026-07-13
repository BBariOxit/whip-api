import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { boardService } from '~/services/boardService'

const sanitizePublicUrl = (value) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

const sanitizeUser = (user) => ({
  _id: user?._id,
  username: user?.username,
  displayName: user?.displayName,
  avatar: sanitizePublicUrl(user?.avatar)
})

const sanitizeAttachment = (attachment) => ({
  url: sanitizePublicUrl(attachment.url),
  filename: attachment.filename,
  format: attachment.format,
  createdAt: attachment.createdAt
})

const sanitizeCard = (card) => ({
  _id: card._id,
  columnId: card.columnId,
  title: card.title,
  layout: card.layout,
  description: card.description || '',
  cover: sanitizePublicUrl(card.cover),
  memberIds: card.memberIds || [],
  labelIds: card.labelIds || [],
  totalComments: card.totalComments || 0,
  dueDate: card.dueDate || null,
  dueComplete: Boolean(card.dueComplete),
  checklists: card.checklists || [],
  attachments: (card.attachments || []).map(sanitizeAttachment).filter((attachment) => attachment.url),
  customFieldValues: card.customFieldValues || [],
  createdAt: card.createdAt,
  updatedAt: card.updatedAt || null
})

const sanitizeLabel = (label) => ({
  _id: label._id,
  title: label.title || '',
  color: label.color
})

const uniqueUsers = (board) => {
  const byId = new Map()
  const users = [...(board.owners || []), ...(board.members || []), ...(board.workspaceMembers || [])]
  users.forEach((user) => {
    if (user?._id) byId.set(user._id.toString(), sanitizeUser(user))
  })
  return [...byId.values()]
}

const getShareBoard = async (userId, boardId, accessRole) => {
  const board = await boardService.getDetails(userId, boardId, accessRole)
  const owners = (board.owners || []).map(sanitizeUser)
  const members = (board.members || []).map(sanitizeUser)
  const isStarredByViewer = userId && (board.starredBy || []).some((id) => id.toString() === userId.toString())

  return {
    _id: board._id,
    title: board.title,
    description: board.description,
    type: board.type,
    background: board.background,
    workspaceId: board.workspaceId || null,
    workspace: board.workspace ? { _id: board.workspace._id, title: board.workspace.title } : null,
    ownerIds: board.ownerIds || [],
    memberIds: board.memberIds || [],
    starredBy: isStarredByViewer ? [userId] : [],
    columnOrderIds: board.columnOrderIds || [],
    columns: (board.columns || []).map((column) => ({
      _id: column._id,
      title: column.title,
      cardOrderIds: column.cardOrderIds || [],
      cards: (column.cards || []).map(sanitizeCard)
    })),
    labels: (board.labels || []).map(sanitizeLabel),
    customFields: board.customFields || [],
    owners,
    members,
    workspaceMembers: [],
    people: uniqueUsers(board),
    userAccessRole: accessRole
  }
}

const getShareCard = async (userId, boardId, cardId, accessRole) => {
  if (!OBJECT_ID_RULE.test(cardId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid card id')
  }

  const board = await getShareBoard(userId, boardId, accessRole)
  let targetCard = null
  let targetColumn = null

  for (const column of board.columns) {
    const card = column.cards.find((item) => item._id.toString() === cardId)
    if (card) {
      targetCard = card
      targetColumn = { _id: column._id, title: column.title }
      break
    }
  }

  if (!targetCard) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Shared card not found')
  }

  const relevantLabelIds = new Set(targetCard.labelIds.map(String))
  const relevantMemberIds = new Set(targetCard.memberIds.map(String))

  return {
    board: {
      _id: board._id,
      title: board.title,
      description: board.description,
      type: board.type,
      background: board.background,
      userAccessRole: board.userAccessRole
    },
    column: targetColumn,
    card: targetCard,
    labels: board.labels.filter((label) => relevantLabelIds.has(label._id.toString())),
    members: board.people.filter((user) => relevantMemberIds.has(user._id.toString())),
    customFields: board.customFields
  }
}

export const shareService = {
  getShareBoard,
  getShareCard
}
