import { ObjectId } from 'mongodb'
import { slugify } from '~/utils/formatter'
import { BOARD_TYPES } from '~/utils/constants'

// Background mặc định cho board (khớp default trong boardModel schema).
const DEFAULT_BOARD_BACKGROUND = { type: 'gradient', color1: '#8a2387', color2: '#e94057' }

/**
 * Dựng document (board + columns + cards + labels) từ một board đã được validate, với ID MỚI
 * và remap toàn bộ tham chiếu chéo (columnOrderIds / cardOrderIds / columnId / labelIds).
 *
 * Hàm THUẦN — không chạm DB — nên dùng chung được cho cả import workspace (nhiều board)
 * lẫn import board lẻ. Đồng thời reset các field nhạy cảm/không mang theo được:
 * memberIds (assignee), attachments (tránh dùng chung publicId Cloudinary), totalComments (comments
 * không được export). slug và timestamps được sinh mới.
 *
 * @param {object} board  board object đã qua Joi (giữ _id cũ để remap)
 * @param {object} opts
 * @param {ObjectId} opts.ownerObjectId  chủ sở hữu mới (người import)
 * @param {ObjectId|null} opts.workspaceId  workspace chứa board (null = Personal Boards)
 * @param {number} opts.now  timestamp dùng chung
 * @param {string} [opts.forceType]  ép board.type (vd import board lẻ → 'private')
 * @returns {{ boardDoc, columnDocs, cardDocs, labelDocs }}
 */
export const buildBoardDocs = (board, { ownerObjectId, workspaceId = null, now = Date.now(), forceType } = {}) => {
  const boardId = new ObjectId()
  const columnIdMap = {} // oldColId(string) -> newColId(ObjectId)
  const cardIdMap = {} // oldCardId(string) -> newCardId(ObjectId)
  const labelIdMap = {} // oldLabelId(string) -> newLabelId(ObjectId)

  // Labels trước vì card tham chiếu tới label.
  const labelDocs = []
  for (const label of (board.labels || [])) {
    const newLabelId = new ObjectId()
    labelIdMap[label._id] = newLabelId
    labelDocs.push({
      _id: newLabelId,
      boardId,
      title: label.title || '',
      color: label.color,
      createdAt: now
    })
  }

  // Columns — giữ tham chiếu tạm (__oldId, __oldCardOrderIds) để remap cardOrderIds ở bước sau.
  const columnDocs = []
  for (const col of (board.columns || [])) {
    const newColId = new ObjectId()
    columnIdMap[col._id] = newColId
    columnDocs.push({
      _id: newColId,
      boardId,
      title: col.title,
      isTemplate: false,
      cardOrderIds: [],
      createdAt: now,
      updatedAt: null,
      _destroy: false,
      __oldId: col._id,
      __oldCardOrderIds: col.cardOrderIds || []
    })
  }

  // Cards — chỉ nhận card có columnId map được (thẻ mồ côi bị bỏ, giống cloneTemplate).
  const cardDocs = []
  const cardsByOldCol = {} // oldColId -> [newCardId] (thứ tự xuất hiện, dùng làm fallback)
  for (const card of (board.cards || [])) {
    const newColId = columnIdMap[card.columnId]
    if (!newColId) continue
    const newCardId = new ObjectId()
    cardIdMap[card._id] = newCardId
    if (!cardsByOldCol[card.columnId]) cardsByOldCol[card.columnId] = []
    cardsByOldCol[card.columnId].push(newCardId)
    cardDocs.push({
      _id: newCardId,
      boardId,
      columnId: newColId,
      isTemplate: false,
      title: card.title,
      layout: card.layout || 'detailed',
      description: card.description || '',
      cover: card.cover ?? null,
      memberIds: [], // reset assignee (userId nguồn vô nghĩa ở đích)
      labelIds: (card.labelIds || []).map((id) => labelIdMap[id]).filter(Boolean),
      totalComments: 0, // comments không được export
      dueDate: card.dueDate ?? null,
      dueComplete: card.dueComplete || false,
      checklists: card.checklists || [], // id nhúng self-contained → giữ nguyên
      attachments: [], // bỏ để tránh dùng chung publicId Cloudinary với nguồn
      customFieldValues: card.customFieldValues || [], // trỏ tới customFields nhúng (giữ nguyên id)
      createdAt: now,
      updatedAt: null,
      _destroy: false
    })
  }

  // Remap cardOrderIds cho mỗi column; nếu rỗng thì fallback theo thứ tự card đã thêm (tránh cột trống).
  for (const colDoc of columnDocs) {
    const remapped = colDoc.__oldCardOrderIds.map((id) => cardIdMap[id]).filter(Boolean)
    colDoc.cardOrderIds = remapped.length > 0 ? remapped : (cardsByOldCol[colDoc.__oldId] || [])
    delete colDoc.__oldId
    delete colDoc.__oldCardOrderIds
  }

  // Remap columnOrderIds; nếu rỗng thì fallback theo thứ tự column (tránh board hiện trống).
  let columnOrderIds = (board.columnOrderIds || []).map((id) => columnIdMap[id]).filter(Boolean)
  if (columnOrderIds.length === 0) columnOrderIds = columnDocs.map((c) => c._id)

  const boardDoc = {
    _id: boardId,
    title: board.title,
    slug: slugify(board.title), // sinh slug mới, không tái dùng slug cũ
    description: board.description,
    type: forceType || board.type || BOARD_TYPES.WORKSPACE_VISIBLE,
    background: board.background || DEFAULT_BOARD_BACKGROUND,
    workspaceId,
    ownerIds: [ownerObjectId],
    memberIds: [],
    starredBy: [],
    columnOrderIds,
    customFields: board.customFields || [],
    isTemplate: false,
    createAt: now, // board schema dùng createAt/updateAt (không phải createdAt) — giữ đúng field gốc
    updateAt: null,
    _destroy: false
  }

  return { boardDoc, columnDocs, cardDocs, labelDocs }
}
