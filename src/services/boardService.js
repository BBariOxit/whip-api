import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { labelModel } from '~/models/labelModel'
import { GET_DB } from '~/config/mongodb'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE, WORKSPACE_ROLES, BOARD_TYPES } from '~/utils/constants'
import { workspaceModel } from '~/models/workspaceModel'
import { ObjectId } from 'mongodb'
import { getBoardAccessRole } from '~/middlewares/rbacMiddleware'
import { buildBoardDocs } from '~/utils/importHelpers'
import { cascadeDeletionService } from './cascadeDeletionService'

// Enforce quyền tạo board trong 1 workspace (dùng chung cho createNew và duplicateBoard).
// - Phải là member active của workspace.
// - boardCreation = 'admin' → chỉ Owner + Admin; 'all' (default) → mọi member.
const assertCanCreateBoardInWorkspace = async (userId, workspaceId) => {
  const workspace = await workspaceModel.findById(workspaceId)
  if (!workspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found!')

  const actor = workspace.members.find(m => m.userId?.toString() === userId.toString() && m.status === 'active')
  if (!actor) throw new ApiError(StatusCodes.FORBIDDEN, 'You are not a member of this workspace!')

  if (workspace.boardCreation !== 'all' && actor.role === WORKSPACE_ROLES.MEMBER) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only Owner and Admin can create boards in this workspace.')
  }
}

const createNew = async (userId, reqBody) => {
  try {
    // Enforce workspace boardCreation setting (chỉ áp dụng khi board thuộc workspace)
    if (reqBody.workspaceId) {
      await assertCanCreateBoardInWorkspace(userId, reqBody.workspaceId)
    }

    // xử lý logic dữ liệu
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // gọi tới tầng model để xử lý lưu bản ghi newBoard vào trong database
    const createdBoard = await boardModel.createNew(userId, newBoard)
    // console.log(createdBoard)

    // lấy bản ghi board sau khi gọi (tùy dự án)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // trả kq về , trong service luôn phải có return
    // (thông báo "board created" in-app do controller bắn vì cần io)
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const buildPortableBoard = (board) => ({
  _id: board._id,
  title: board.title,
  description: board.description,
  type: board.type,
  background: board.background,
  columnOrderIds: board.columnOrderIds || [],
  columns: (board.columns || []).map(column => ({
    _id: column._id,
    title: column.title,
    cardOrderIds: column.cardOrderIds || []
  })),
  cards: (board.cards || []).map(card => ({
    _id: card._id,
    columnId: card.columnId,
    title: card.title,
    layout: card.layout,
    description: card.description,
    cover: card.cover,
    labelIds: card.labelIds || [],
    dueDate: card.dueDate,
    dueComplete: card.dueComplete || false,
    checklists: card.checklists || [],
    customFieldValues: card.customFieldValues || []
  })),
  labels: (board.labels || []).map(label => ({
    _id: label._id,
    title: label.title,
    color: label.color
  })),
  customFields: (board.customFields || []).map(field => ({
    _id: field._id,
    name: field.name,
    type: field.type,
    options: field.options || [],
    showOnFront: field.showOnFront || false
  }))
})

// Export a portable, restorable board snapshot. Collaborator IDs, comments and
// Cloudinary attachments are intentionally excluded because they cannot be
// safely transferred to another account.
// Quyền đã được chặn ở route bằng requireBoardRole(['admin','member']) → chỉ owner/member export được.
const exportData = async (userId, boardId) => {
  try {
    if (!OBJECT_ID_RULE.test(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'board not found!')
    }

    return {
      schemaVersion: 1,
      kind: 'board',
      exportedAt: new Date().toISOString(),
      excludedData: ['comments', 'attachments', 'memberAssignments'],
      board: buildPortableBoard(board)
    }
  } catch (error) {
    throw error
  }
}

// Import 1 board lẻ từ file JSON → tạo board mới trong Personal Boards của người import.
// Ép PRIVATE vì không có ngữ cảnh workspace (giống cloneTemplate). Người import là owner duy nhất.
// reqBody đã được validation strip sạch (chỉ còn field whitelist).
const importBoard = async (userId, reqBody) => {
  try {
    const ownerObjectId = new ObjectId(userId)
    const { boardDoc, columnDocs, cardDocs, labelDocs } = buildBoardDocs(reqBody.board, {
      ownerObjectId,
      workspaceId: null,
      forceType: BOARD_TYPES.PRIVATE
    })

    const newBoardId = await boardModel.importBoard({ boardDoc, columnDocs, cardDocs, labelDocs })
    return {
      boardId: newBoardId,
      counts: { columns: columnDocs.length, cards: cardDocs.length, labels: labelDocs.length }
    }
  } catch (error) {
    throw error
  }
}

// Nhân bản 1 board có sẵn thành bản sao MỚI trong CÙNG ngữ cảnh (giữ workspaceId + type).
// Người bấm là owner duy nhất. Tái dùng đúng logic remap của import (buildBoardDocs): coi board
// sống như một "bản export trong bộ nhớ" (JSON.stringify để ObjectId thành chuỗi, khớp shape helper cần).
const duplicateBoard = async (userId, boardId) => {
  try {
    if (!OBJECT_ID_RULE.test(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'board not found!')
    }

    // Gatekeeper xem: board private thì chỉ owner/member mới được đọc → mới được duplicate.
    const isOwner = board.ownerIds?.some(id => id.toString() === userId)
    const isMember = board.memberIds?.some(id => id.toString() === userId)
    if (board.type === BOARD_TYPES.PRIVATE && !isOwner && !isMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied. You cannot duplicate this private board.')
    }

    // Nếu board thuộc workspace: bản sao cũng vào workspace đó → phải có quyền tạo board ở đây.
    if (board.workspaceId) {
      await assertCanCreateBoardInWorkspace(userId, board.workspaceId.toString())
    }

    // Tên bản sao có hậu tố "(Copy)", cắt bớt gốc nếu vượt 50 ký tự để vẫn hợp lệ khi sửa tên sau.
    const suffix = ' (Copy)'
    const dupTitle = (board.title + suffix).length > 50
      ? board.title.slice(0, 50 - suffix.length) + suffix
      : board.title + suffix

    // JSON hoá board sống → shape giống file export (ObjectId thành chuỗi) để buildBoardDocs remap.
    const src = JSON.parse(JSON.stringify(board))
    const boardForBuild = {
      title: dupTitle,
      description: src.description,
      type: src.type, // GIỮ nguyên type (không ép private như import board lẻ)
      background: src.background,
      columnOrderIds: src.columnOrderIds,
      columns: src.columns,
      cards: src.cards,
      labels: src.labels,
      customFields: src.customFields
    }

    const { boardDoc, columnDocs, cardDocs, labelDocs } = buildBoardDocs(boardForBuild, {
      ownerObjectId: new ObjectId(userId),
      workspaceId: board.workspaceId ? new ObjectId(board.workspaceId) : null // GIỮ workspace của nguồn
    })

    const newBoardId = await boardModel.importBoard({ boardDoc, columnDocs, cardDocs, labelDocs })
    // Trả về board object đầy đủ để FE chèn card ngay cạnh bản gốc.
    return await boardModel.findOneById(newBoardId)
  } catch (error) {
    throw error
  }
}

const getDetails = async (userId, boardId, precomputedAccessRole = null) => {
  try {
    if (!OBJECT_ID_RULE.test(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'board not found!')
    }

    // Defense in depth: middleware là chốt đầu tiên, service kiểm tra lại để
    // caller mới không thể vô tình bỏ qua quyền kế thừa từ workspace.
    const accessRole = precomputedAccessRole || await getBoardAccessRole(board, userId)
    if (accessRole === 'none') {
      const statusCode = userId ? StatusCodes.FORBIDDEN : StatusCodes.UNAUTHORIZED
      throw new ApiError(
        statusCode,
        userId
          ? 'Access denied. You do not have permission to view this board.'
          : 'Authentication is required to view this board.'
      )
    }

    // // B1: structuredClone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu,
    // // tùy mục đích về sau mà có cần structuredClone hay không.
    // const resBoard = structuredClone(board)
    // // B2: đưa card về đúng column của nó
    // resBoard.columns.forEach(column => {
    //   column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals
    //   // column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    // })
    // // B3: xóa mảng card khỏi board ban đầu
    // delete resBoard.cards

    // khi xài structuredClone, nó làm bay sạch method của ObjectId, gọi .toString() nó sẽ ra cái chuỗi "[object Object]" hoặc mớ hỗn độn nào đó
    // => ép kiểu toàn bộ Object về String trước khi filter, hoặc xài clone deep của lodash

    // B1: Dùng cách này để "String hóa" toàn bộ ObjectId một cách nhanh nhất
    const resBoard = JSON.parse(JSON.stringify(board))

    // B2: đưa card về đúng column của nó
    // bây giờ resBoard._id, column._id, card.columnId... ĐỀU LÀ STRING NGUYÊN BẢN
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId === column._id)
    })

    // B3: xóa mảng card khỏi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const updateVisibility = async (userId, boardId, type) => {
  try {
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const isOwner = board.ownerIds?.some(id => id.toString() === userId)
    if (!isOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only the creator of this board can change its visibility!')
    }

    const updatedBoard = await boardModel.update(boardId, {
      type: type,
      updatedAt: Date.now()
    })

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardifferentColumn = async (reqBody, userId) => {
  try {
    // Lấy card + 2 column liên quan để validate & phân quyền (không tin boardId từ client)
    const [card, prevColumn, nextColumn] = await Promise.all([
      cardModel.findOneById(reqBody.currCardId),
      columnModel.findOneById(reqBody.prevColumnId),
      columnModel.findOneById(reqBody.nextColumnId)
    ])
    if (!card || !prevColumn || !nextColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card or column not found!')
    }

    // 👑 Chống IDOR: card và cả 2 column bắt buộc cùng thuộc 1 board
    const boardId = card.boardId.toString()
    if (prevColumn.boardId.toString() !== boardId || nextColumn.boardId.toString() !== boardId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Card and columns must belong to the same board!')
    }

    // 👑 Phân quyền: chỉ admin/member của board mới được di chuyển card (chặn viewer & người ngoài)
    const board = await boardModel.findOneById(boardId)
    const role = board ? await getBoardAccessRole(board, userId) : 'none'
    if (role !== 'admin' && role !== 'member') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to move cards on this board!')
    }

    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (bản chất là xóa cái _id của Card ra khỏi mảng cũ)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (bản chất là thêm _id của Card vào mảng mới)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nexCardOrderIds,
      updatedAt: Date.now()
    })
    // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
    await cardModel.update(reqBody.currCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Sucessfully!' }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters, sortOption) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters,
      sortOption
    )

    return results
  } catch (error) { throw error }
}

const deleteItem = async (boardId, actorBoardRole) => {
  try {
    const targetBoard = await boardModel.findOneById(boardId)
    if (!targetBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Enforce workspace boardDeletion setting:
    // Nếu user chỉ là 'member' (board role), phải check workspace.boardDeletion có = 'all' không
    // Admin (board role) luôn được xóa bất kể setting
    if (actorBoardRole === 'member' && targetBoard.workspaceId) {
      const workspace = await workspaceModel.findById(targetBoard.workspaceId.toString())
      if (!workspace || workspace.boardDeletion !== 'all') {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Only Owner and Admin can delete boards in this workspace.')
      }
    }

    const { assetCleanup } = await cascadeDeletionService.deleteBoards([boardId])
    const assetCleanupFailures = assetCleanup.filter(item => item.status === 'failed').length

    // Trả kèm workspaceId + title để controller bắn thông báo "board deleted" in-app.
    // Cascade (xoá cả workspace) gọi thẳng service nên KHÔNG bắn — tránh spam hàng loạt.
    return {
      deleteResult: 'Board and its Columns, Cards deleted successfully!',
      workspaceId: targetBoard.workspaceId,
      boardTitle: targetBoard.title,
      assetCleanupFailures
    }
  } catch (error) {
    throw error
  }
}

const bulkDeleteItems = async (userId, boardIds) => {
  try {
    if (!boardIds || !Array.isArray(boardIds) || boardIds.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Board IDs array is empty')
    }

    const objectIds = boardIds.map(id => new ObjectId(id))
    const db = GET_DB()

    // Find boards that actually belong to the user and match the IDs
    const boardsToDelete = await db.collection(boardModel.BOARD_COLLECTION_NAME).find({
      _id: { $in: objectIds },
      ownerIds: { $all: [new ObjectId(userId)] }
    }).toArray()

    // Không cần check workspace.boardDeletion ở đây: query trên đã filter theo ownerIds,
    // nên mọi board đến được bước này đều do chính user tạo (board admin) → luôn được xóa,
    // nhất quán với deleteItem (creator xóa được board của mình bất kể setting).
    const allowedBoardIds = boardsToDelete.map(board => board._id)

    const { assetCleanup } = await cascadeDeletionService.deleteBoards(
      allowedBoardIds.map(id => id.toString())
    )

    return {
      deleteResult: `Successfully deleted ${allowedBoardIds.length} boards!`,
      assetCleanupFailures: assetCleanup.filter(item => item.status === 'failed').length
    }
  } catch (error) {
    throw error
  }
}

const getTemplates = async () => {
  try {
    const results = await boardModel.getTemplates()
    return results
  } catch (error) { throw error }
}

const cloneTemplate = async (userId, templateBoardId) => {
  try {
    // 1. Lấy board template gốc.
    // 👑 Bảo mật: chỉ chấp nhận board thực sự là template và chưa bị xoá mềm.
    // Nhờ điều kiện isTemplate này, user KHÔNG thể lợi dụng endpoint để clone (đọc trộm) một
    // board private bất kỳ bằng cách truyền id của nó vào — vì board thường không có isTemplate=true.
    const templateBoard = await boardModel.findOneById(templateBoardId)
    if (!templateBoard || !templateBoard.isTemplate || templateBoard._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Template not found!')
    }

    // Fetch columns of the template
    const templateColumns = await GET_DB().collection(columnModel.COLUMN_COLLECTION_NAME).find({
      boardId: templateBoard._id
    }).toArray()

    // Fetch cards of the template
    const templateCards = await GET_DB().collection(cardModel.CARD_COLLECTION_NAME).find({
      boardId: templateBoard._id
    }).toArray()

    // Fetch labels of the template
    const templateLabels = await GET_DB().collection(labelModel.LABEL_COLLECTION_NAME).find({
      boardId: templateBoard._id
    }).toArray()

    // 2. Tạo board mới từ template.
    // Cố tình KHÔNG gán workspaceId => board thuộc "Personal Boards" của user.
    // boardModel.createNew sẽ tự set ownerIds = [userId] => người clone chính là chủ board.
    const newTitle = `${templateBoard.title} (Bản sao)`
    const newBoardData = {
      title: newTitle,
      slug: slugify(newTitle),
      description: templateBoard.description,
      type: 'private', // Board mới mặc định private, chỉ mình chủ board thấy
      background: templateBoard.background,
      isTemplate: false
    }

    const createdBoard = await boardModel.createNew(userId, newBoardData)
    const newBoardId = createdBoard.insertedId

    // 3. Clone columns
    const columnIdMapping = {}
    const newColumnOrderIds = []

    for (const col of templateColumns) {
      const newColData = {
        boardId: newBoardId,
        title: col.title,
        cardOrderIds: [],
        createdAt: Date.now(),
        updatedAt: null,
        _destroy: false
      }
      const createdCol = await GET_DB().collection(columnModel.COLUMN_COLLECTION_NAME).insertOne(newColData)
      columnIdMapping[col._id.toString()] = createdCol.insertedId
      newColumnOrderIds.push(createdCol.insertedId)
    }

    // Clone labels
    const labelIdMapping = {}
    const newLabelsData = []
    for (const label of templateLabels) {
      const newLabelId = new ObjectId()
      labelIdMapping[label._id.toString()] = newLabelId
      const newLabel = {
        ...label,
        _id: newLabelId,
        boardId: newBoardId,
        createdAt: Date.now()
      }
      newLabelsData.push(newLabel)
    }

    if (newLabelsData.length > 0) {
      await GET_DB().collection(labelModel.LABEL_COLLECTION_NAME).insertMany(newLabelsData)
    }

    // Clone cards
    const cardIdMapping = {}
    const newCardsData = []
    for (const card of templateCards) {
      const newColId = columnIdMapping[card.columnId.toString()]
      if (newColId) {
        const newCardId = new ObjectId()
        cardIdMapping[card._id.toString()] = newCardId

        // Map labelIds
        const mappedLabelIds = (card.labelIds || []).map(oldLabelId => labelIdMapping[oldLabelId.toString()]).filter(id => id)

        const newCard = {
          ...card,
          _id: newCardId,
          boardId: newBoardId,
          columnId: newColId,
          labelIds: mappedLabelIds,
          memberIds: [], // Reset members
          createdAt: Date.now(),
          updatedAt: null
        }
        newCardsData.push(newCard)
      }
    }

    if (newCardsData.length > 0) {
      await GET_DB().collection(cardModel.CARD_COLLECTION_NAME).insertMany(newCardsData)
    }

    // 4. Update new board's columnOrderIds and columns' cardOrderIds
    if (newColumnOrderIds.length > 0) {
      const orderedNewColIds = templateBoard.columnOrderIds
        .map(oldId => columnIdMapping[oldId.toString()])
        .filter(id => id)

      await boardModel.update(newBoardId, {
        columnOrderIds: orderedNewColIds
      })

      // Update cardOrderIds for new columns
      for (const col of templateColumns) {
        const newColId = columnIdMapping[col._id.toString()]
        if (newColId && col.cardOrderIds && col.cardOrderIds.length > 0) {
          // Map old card IDs to new card IDs
          const newCardOrderIds = col.cardOrderIds
            .map(oldCardId => cardIdMapping[oldCardId.toString()])
            .filter(id => id)

          await columnModel.update(newColId, {
            cardOrderIds: newCardOrderIds
          })
        }
      }
    }

    return await boardModel.findOneById(newBoardId)
  } catch (error) {
    throw error
  }
}

const getArchivedItems = async (boardId) => {
  try {
    const archivedCards = await cardModel.getArchivedByBoardId(boardId)
    const archivedColumns = await columnModel.getArchivedByBoardId(boardId)

    return {
      cards: archivedCards,
      columns: archivedColumns
    }
  } catch (error) {
    throw error
  }
}

const joinBoard = async (userId, boardId) => {
  try {
    if (!OBJECT_ID_RULE.test(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }

    const board = await boardModel.findOneById(boardId)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    if (board.type === BOARD_TYPES.PRIVATE) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot join a private board!')
    }

    if (board.type === BOARD_TYPES.WORKSPACE_VISIBLE) {
      if (!board.workspaceId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Workspace-visible boards must belong to a workspace!')
      }

      const workspace = await workspaceModel.findById(board.workspaceId.toString())
      const isActiveWorkspaceMember = workspace?.members?.some(member => (
        member.userId?.toString() === userId.toString() &&
        member.status === 'active'
      ))
      if (!isActiveWorkspaceMember) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          'Only active workspace members can join this board!'
        )
      }
    }

    const isAlreadyJoined = board.memberIds?.some(id => id.toString() === userId.toString())
    const isOwner = board.ownerIds?.some(id => id.toString() === userId.toString())

    if (isAlreadyJoined || isOwner) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You are already a member of this board!')
    }

    await boardModel.pushMemberIds(boardId, userId)

    const newMember = await userModel.findOneById(userId)

    return {
      _id: newMember._id,
      email: newMember.email,
      username: newMember.username,
      displayName: newMember.displayName,
      avatar: newMember.avatar
    }
  } catch (error) { throw error }
}

const leaveBoard = async (userId, boardId) => {
  try {
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    const isMember = board.memberIds?.some(id => id.toString() === userId.toString())
    if (!isMember) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'You are not a member of this board!')
    }

    const isOwner = board.ownerIds?.some(id => id.toString() === userId.toString())
    if (isOwner) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The board owner cannot leave. Transfer ownership first or delete the board.'
      )
    }

    const result = await boardModel.pullMemberIds(boardId, userId)
    return result
  } catch (error) {
    throw error
  }
}

const getStarredBoards = async (userId) => {
  try {
    const results = await boardModel.getStarredBoards(userId)
    return results
  } catch (error) {
    throw error
  }
}

const toggleStarred = async (userId, boardId) => {
  try {
    if (!OBJECT_ID_RULE.test(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }

    const board = await boardModel.findOneById(boardId)
    if (!board || board._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // 👑 Chốt chặn bảo mật: không cho user gắn sao một board private mà họ không thuộc về.
    // (Cùng nguyên tắc gatekeeper như getDetails ở trên)
    const isOwner = board.ownerIds?.some(id => id.toString() === userId)
    const isMember = board.memberIds?.some(id => id.toString() === userId)
    if (board.type === 'private' && !isOwner && !isMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied. You cannot star a private board you do not belong to.')
    }

    // Toggle: đang có sao thì gỡ, chưa có thì thêm
    const isStarred = board.starredBy?.some(id => id.toString() === userId)
    if (isStarred) {
      await boardModel.unstarBoard(boardId, userId)
      return { boardId, starred: false }
    }
    await boardModel.starBoard(boardId, userId)
    return { boardId, starred: true }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  exportData,
  importBoard,
  duplicateBoard,
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
  joinBoard,
  leaveBoard,
  getStarredBoards,
  toggleStarred
}
