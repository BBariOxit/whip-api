import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { ObjectId } from 'mongodb'

let replSet
let db
let closeDatabase
let jwtProvider
let app

const TEST_ACCESS_SECRET = 'integration-test-access-secret-at-least-32-characters'
const cloudinaryMocks = vi.hoisted(() => ({
  deleteResource: vi.fn(async () => ({ result: 'ok' }))
}))

vi.mock('~/providers/CloudinaryProvider', () => ({
  cloudinaryProvider: {
    deleteResource: cloudinaryMocks.deleteResource,
    getPublicIdFromUrl: vi.fn(() => null),
    streamUpload: vi.fn()
  }
}))

const createUser = async (email) => {
  const user = {
    _id: new ObjectId(),
    email,
    password: null,
    username: email.split('@')[0],
    displayName: email.split('@')[0],
    avatar: null,
    role: 'client',
    isActive: true,
    verifyToken: null,
    loginType: 'email',
    tokenVersion: 0,
    createdAt: Date.now(),
    updatedAt: null,
    _destroy: false
  }
  await db.collection('users').insertOne(user)
  return user
}

const createWorkspace = async ({
  owner,
  members = [],
  boardDeletion = 'admin'
}) => {
  const workspace = {
    _id: new ObjectId(),
    title: 'Integration Workspace',
    description: 'Workspace used by integration tests',
    visibility: 'private',
    invitePermission: 'admin',
    boardCreation: 'all',
    boardDeletion,
    members: [
      {
        userId: owner._id,
        email: owner.email,
        role: 'owner',
        status: 'active',
        inviteToken: null,
        joinedAt: Date.now()
      },
      ...members
    ],
    createdAt: Date.now(),
    updatedAt: null,
    _destroy: false
  }
  await db.collection('workspaces').insertOne(workspace)
  return workspace
}

const createBoard = async ({
  owner,
  type = 'private',
  workspaceId = null,
  memberIds = []
}) => {
  const board = {
    _id: new ObjectId(),
    title: 'Integration Board',
    slug: 'integration-board',
    description: 'Board used by integration tests',
    type,
    background: {
      type: 'solid',
      color1: '#123456',
      color2: '#123456',
      image: null
    },
    workspaceId,
    ownerIds: [owner._id],
    memberIds,
    starredBy: [],
    columnOrderIds: [],
    customFields: [],
    createdAt: Date.now(),
    updatedAt: null,
    _destroy: false
  }
  await db.collection('boards').insertOne(board)
  return board
}

const authCookie = async (user) => {
  const token = await jwtProvider.generateToken(
    {
      _id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      tokenVersion: user.tokenVersion
    },
    TEST_ACCESS_SECRET,
    '1h'
  )
  return `accessToken=${token}`
}

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' }
  })

  process.env.MONGODB_URI = replSet.getUri()
  process.env.DATABASE_NAME = 'whip_integration'
  process.env.BUILD_MODE = 'test'
  process.env.ACCESS_TOKEN_SECRET_SIGNATURE = TEST_ACCESS_SECRET
  process.env.ACCESS_TOKEN_LIFE = '1h'
  process.env.REFRESH_TOKEN_SECRET_SIGNATURE = 'integration-test-refresh-secret-at-least-32-characters'
  process.env.REFRESH_TOKEN_LIFE = '7d'

  const mongodb = await import('~/config/mongodb')
  const [{ APIs_V1 }, { errorHandlingMiddleware }, jwtModule] = await Promise.all([
    import('~/routes/v1'),
    import('~/middlewares/errorHandlingMiddleware'),
    import('~/providers/JwtProvider')
  ])

  await mongodb.CONNECT_DB()
  db = mongodb.GET_DB()
  closeDatabase = mongodb.CLOSE_DB
  jwtProvider = jwtModule.jwtProvider

  app = express()
  app.use(cookieParser())
  app.use(express.json())
  app.use('/v1', APIs_V1)
  app.use(errorHandlingMiddleware)
})

beforeEach(async () => {
  cloudinaryMocks.deleteResource.mockClear()
  const collections = await db.collections()
  await Promise.all(collections.map(collection => collection.deleteMany({})))
})

afterAll(async () => {
  if (closeDatabase) await closeDatabase()
  if (replSet) await replSet.stop()
})

describe('board RBAC', () => {
  it('allows public reads but denies private boards to outsiders', async () => {
    const owner = await createUser('owner-rbac@example.com')
    const outsider = await createUser('outsider-rbac@example.com')
    const publicBoard = await createBoard({ owner, type: 'public' })
    const privateBoard = await createBoard({ owner, type: 'private' })

    await request(app)
      .get(`/v1/boards/${publicBoard._id}`)
      .expect(200)

    await request(app)
      .get(`/v1/boards/${privateBoard._id}`)
      .set('Cookie', await authCookie(outsider))
      .expect(403)
  })

  it('grants workspace-visible access only to active workspace members', async () => {
    const owner = await createUser('owner-workspace-rbac@example.com')
    const member = await createUser('member-workspace-rbac@example.com')
    const pending = await createUser('pending-workspace-rbac@example.com')
    const workspace = await createWorkspace({
      owner,
      members: [
        {
          userId: member._id,
          email: member.email,
          role: 'member',
          status: 'active',
          inviteToken: null,
          joinedAt: Date.now()
        },
        {
          userId: pending._id,
          email: pending.email,
          role: 'member',
          status: 'pending',
          inviteToken: 'pending-token',
          joinedAt: Date.now()
        }
      ]
    })
    const board = await createBoard({
      owner,
      workspaceId: workspace._id,
      type: 'workspace_visible'
    })

    await request(app)
      .get(`/v1/boards/${board._id}`)
      .set('Cookie', await authCookie(member))
      .expect(200)

    await request(app)
      .get(`/v1/boards/${board._id}`)
      .set('Cookie', await authCookie(pending))
      .expect(403)
  })
})

describe('board ownership transfer', () => {
  it('transfers ownership atomically to an active direct member', async () => {
    const owner = await createUser('owner-transfer@example.com')
    const member = await createUser('member-transfer@example.com')
    const board = await createBoard({ owner, memberIds: [member._id] })

    const response = await request(app)
      .post(`/v1/boards/${board._id}/transfer-ownership`)
      .set('Cookie', await authCookie(owner))
      .send({ targetUserId: member._id.toString() })
      .expect(200)

    expect(response.body.board.ownerIds).toContain(member._id.toString())
    expect(response.body.board.ownerIds).not.toContain(owner._id.toString())
    expect(response.body.board.memberIds).toContain(owner._id.toString())
    expect(response.body.board.memberIds).not.toContain(member._id.toString())

    await request(app)
      .post(`/v1/boards/${board._id}/leave`)
      .set('Cookie', await authCookie(owner))
      .expect(200)

    const updatedBoard = await db.collection('boards').findOne({ _id: board._id })
    expect(updatedBoard.ownerIds.map(id => id.toString())).toEqual([member._id.toString()])
    expect(updatedBoard.memberIds.map(id => id.toString())).not.toContain(owner._id.toString())
  })

  it('rejects non-members and inactive members as ownership targets', async () => {
    const owner = await createUser('owner-invalid-transfer@example.com')
    const inactiveMember = await createUser('inactive-transfer@example.com')
    const outsider = await createUser('outsider-transfer@example.com')
    await db.collection('users').updateOne(
      { _id: inactiveMember._id },
      { $set: { isActive: false } }
    )
    const board = await createBoard({ owner, memberIds: [inactiveMember._id] })

    await request(app)
      .post(`/v1/boards/${board._id}/transfer-ownership`)
      .set('Cookie', await authCookie(owner))
      .send({ targetUserId: outsider._id.toString() })
      .expect(400)

    await request(app)
      .post(`/v1/boards/${board._id}/transfer-ownership`)
      .set('Cookie', await authCookie(owner))
      .send({ targetUserId: inactiveMember._id.toString() })
      .expect(400)

    const unchangedBoard = await db.collection('boards').findOne({ _id: board._id })
    expect(unchangedBoard.ownerIds.map(id => id.toString())).toEqual([owner._id.toString()])
  })

  it('blocks inherited workspace admins from transferring board ownership', async () => {
    const workspaceOwner = await createUser('workspace-owner-transfer@example.com')
    const boardOwner = await createUser('board-owner-transfer@example.com')
    const targetMember = await createUser('target-transfer@example.com')
    const workspace = await createWorkspace({
      owner: workspaceOwner,
      members: [{
        userId: boardOwner._id,
        email: boardOwner.email,
        role: 'member',
        status: 'active',
        inviteToken: null,
        joinedAt: Date.now()
      }]
    })
    const board = await createBoard({
      owner: boardOwner,
      workspaceId: workspace._id,
      memberIds: [targetMember._id]
    })

    await request(app)
      .post(`/v1/boards/${board._id}/transfer-ownership`)
      .set('Cookie', await authCookie(workspaceOwner))
      .send({ targetUserId: targetMember._id.toString() })
      .expect(403)

    const unchangedBoard = await db.collection('boards').findOne({ _id: board._id })
    expect(unchangedBoard.ownerIds.map(id => id.toString())).toEqual([boardOwner._id.toString()])
  })
})

describe('board invitations', () => {
  it('blocks unauthorized inviters and only lets the addressed invitee respond', async () => {
    const owner = await createUser('owner-invite@example.com')
    const invitee = await createUser('invitee-invite@example.com')
    const outsider = await createUser('outsider-invite@example.com')
    const board = await createBoard({ owner })

    await request(app)
      .post('/v1/invitations/board')
      .set('Cookie', await authCookie(outsider))
      .send({ boardId: board._id.toString(), inviteeEmail: invitee.email })
      .expect(403)

    const createResponse = await request(app)
      .post('/v1/invitations/board')
      .set('Cookie', await authCookie(owner))
      .send({ boardId: board._id.toString(), inviteeEmail: invitee.email })
      .expect(201)

    const invitationId = createResponse.body._id
    expect(new Date(createResponse.body.expiresAt).getTime()).toBeGreaterThan(Date.now())

    await request(app)
      .post('/v1/invitations/board')
      .set('Cookie', await authCookie(owner))
      .send({ boardId: board._id.toString(), inviteeEmail: invitee.email })
      .expect(409)

    await request(app)
      .put(`/v1/invitations/board/${invitationId}`)
      .set('Cookie', await authCookie(outsider))
      .send({ status: 'ACCEPTED' })
      .expect(403)

    await request(app)
      .put(`/v1/invitations/board/${invitationId}`)
      .set('Cookie', await authCookie(invitee))
      .send({ status: 'ACCEPTED' })
      .expect(200)

    const updatedBoard = await db.collection('boards').findOne({ _id: board._id })
    expect(updatedBoard.memberIds.map(id => id.toString())).toContain(invitee._id.toString())

    await request(app)
      .put(`/v1/invitations/board/${invitationId}`)
      .set('Cookie', await authCookie(invitee))
      .send({ status: 'REJECTED' })
      .expect(409)
  })

  it('expires, cancels, lists and resends invitations through valid transitions', async () => {
    const owner = await createUser('owner-invite-lifecycle@example.com')
    const invitee = await createUser('invitee-invite-lifecycle@example.com')
    const outsider = await createUser('outsider-invite-lifecycle@example.com')
    const board = await createBoard({ owner })

    const created = await request(app)
      .post('/v1/invitations/board')
      .set('Cookie', await authCookie(owner))
      .send({ boardId: board._id.toString(), inviteeEmail: invitee.email })
      .expect(201)

    await request(app)
      .delete(`/v1/invitations/board/${created.body._id}`)
      .set('Cookie', await authCookie(outsider))
      .expect(403)

    const cancelled = await request(app)
      .delete(`/v1/invitations/board/${created.body._id}`)
      .set('Cookie', await authCookie(owner))
      .expect(200)
    expect(cancelled.body.boardInvitation.status).toBe('CANCELLED')

    const resent = await request(app)
      .post(`/v1/invitations/board/${created.body._id}/resend`)
      .set('Cookie', await authCookie(owner))
      .expect(200)
    expect(resent.body.boardInvitation.status).toBe('PENDING')
    expect(new Date(resent.body.expiresAt).getTime()).toBeGreaterThan(Date.now())

    const listed = await request(app)
      .get(`/v1/invitations/board?boardId=${board._id}`)
      .set('Cookie', await authCookie(owner))
      .expect(200)
    expect(listed.body).toHaveLength(1)
    expect(listed.body[0].invitee.email).toBe(invitee.email)

    await db.collection('invitations').updateOne(
      { _id: new ObjectId(created.body._id) },
      { $set: { expiresAt: new Date(Date.now() - 1000) } }
    )
    await request(app)
      .put(`/v1/invitations/board/${created.body._id}`)
      .set('Cookie', await authCookie(invitee))
      .send({ status: 'ACCEPTED' })
      .expect(410)

    const expired = await db.collection('invitations').findOne({
      _id: new ObjectId(created.body._id)
    })
    expect(expired.boardInvitation.status).toBe('EXPIRED')
  })

  it('expires workspace invitation links and removes stale pending members', async () => {
    const owner = await createUser('owner-workspace-invite-expiry@example.com')
    const invitee = await createUser('invitee-workspace-invite-expiry@example.com')
    const token = 'expired-workspace-invitation-token'
    const workspace = await createWorkspace({
      owner,
      members: [{
        userId: invitee._id,
        email: invitee.email,
        role: 'member',
        status: 'pending',
        inviteToken: token,
        inviteExpiresAt: new Date(Date.now() - 1000),
        joinedAt: Date.now()
      }]
    })

    await request(app)
      .put('/v1/workspaces/accept-invite')
      .set('Cookie', await authCookie(invitee))
      .send({ token, workspaceId: workspace._id.toString() })
      .expect(410)

    const updatedWorkspace = await db.collection('workspaces').findOne({
      _id: workspace._id
    })
    expect(updatedWorkspace.members.map(member => member.email)).not.toContain(invitee.email)
  })
})

describe('joining boards', () => {
  it('enforces visibility rules for private, public and workspace-visible boards', async () => {
    const owner = await createUser('owner-join@example.com')
    const workspaceMember = await createUser('workspace-member-join@example.com')
    const outsider = await createUser('outsider-join@example.com')
    const workspace = await createWorkspace({
      owner,
      members: [{
        userId: workspaceMember._id,
        email: workspaceMember.email,
        role: 'member',
        status: 'active',
        inviteToken: null,
        joinedAt: Date.now()
      }]
    })
    const workspaceBoard = await createBoard({
      owner,
      workspaceId: workspace._id,
      type: 'workspace_visible'
    })
    const publicBoard = await createBoard({ owner, type: 'public' })
    const privateBoard = await createBoard({ owner, type: 'private' })

    await request(app)
      .post(`/v1/boards/${workspaceBoard._id}/join`)
      .set('Cookie', await authCookie(outsider))
      .expect(403)

    await request(app)
      .post(`/v1/boards/${workspaceBoard._id}/join`)
      .set('Cookie', await authCookie(workspaceMember))
      .expect(200)

    await request(app)
      .post(`/v1/boards/${publicBoard._id}/join`)
      .set('Cookie', await authCookie(outsider))
      .expect(200)

    await request(app)
      .post(`/v1/boards/${privateBoard._id}/join`)
      .set('Cookie', await authCookie(outsider))
      .expect(403)
  })
})

describe('personal board archive import', () => {
  it('restores every board atomically with new private ownership', async () => {
    const user = await createUser('personal-import@example.com')
    const sourceBoardId = new ObjectId()
    const sourceColumnId = new ObjectId()
    const sourceCardId = new ObjectId()
    const archive = {
      schemaVersion: 1,
      kind: 'personal-boards',
      count: 2,
      boards: [
        {
          schemaVersion: 1,
          kind: 'board',
          board: {
            _id: sourceBoardId.toString(),
            title: 'Imported board one',
            description: 'First imported board',
            type: 'public',
            background: { type: 'solid', color1: '#123456' },
            columnOrderIds: [sourceColumnId.toString()],
            columns: [{
              _id: sourceColumnId.toString(),
              title: 'Imported column',
              cardOrderIds: [sourceCardId.toString()]
            }],
            cards: [{
              _id: sourceCardId.toString(),
              columnId: sourceColumnId.toString(),
              title: 'Imported card'
            }],
            labels: [],
            customFields: []
          }
        },
        {
          schemaVersion: 1,
          kind: 'board',
          board: {
            _id: new ObjectId().toString(),
            title: 'Imported board two',
            description: 'Second imported board',
            type: 'workspace_visible',
            background: { type: 'solid', color1: '#654321' },
            columnOrderIds: [],
            columns: [],
            cards: [],
            labels: [],
            customFields: []
          }
        }
      ]
    }

    const response = await request(app)
      .post('/v1/boards/import-personal')
      .set('Cookie', await authCookie(user))
      .send(archive)
      .expect(201)

    expect(response.body.count).toBe(2)
    const importedBoards = await db.collection('boards')
      .find({ ownerIds: user._id })
      .sort({ title: 1 })
      .toArray()
    expect(importedBoards).toHaveLength(2)
    expect(importedBoards.every(board => (
      board.type === 'private' &&
      board.workspaceId === null &&
      board.ownerIds.length === 1 &&
      board.ownerIds[0].toString() === user._id.toString()
    ))).toBe(true)
    expect(importedBoards[0]._id.toString()).not.toBe(sourceBoardId.toString())

    const importedCard = await db.collection('cards').findOne({
      boardId: importedBoards[0]._id
    })
    const importedColumn = await db.collection('columns').findOne({
      boardId: importedBoards[0]._id
    })
    expect(importedCard.columnId.toString()).toBe(importedColumn._id.toString())
    expect(importedColumn.cardOrderIds[0].toString()).toBe(importedCard._id.toString())
  })

  it('rejects an invalid archive before writing any board', async () => {
    const user = await createUser('invalid-personal-import@example.com')
    await request(app)
      .post('/v1/boards/import-personal')
      .set('Cookie', await authCookie(user))
      .send({
        schemaVersion: 1,
        kind: 'personal-boards',
        boards: [{
          schemaVersion: 1,
          kind: 'board',
          board: {
            _id: new ObjectId().toString(),
            title: 'x',
            description: 'Invalid board title',
            columns: [],
            cards: []
          }
        }]
      })
      .expect(422)

    expect(await db.collection('boards').countDocuments({ ownerIds: user._id })).toBe(0)
  })
})

describe('delete and access revocation', () => {
  it('enforces workspace board-deletion policy and removes board children', async () => {
    const owner = await createUser('owner-delete@example.com')
    const member = await createUser('member-delete@example.com')
    const workspace = await createWorkspace({
      owner,
      members: [{
        userId: member._id,
        email: member.email,
        role: 'member',
        status: 'active',
        inviteToken: null,
        joinedAt: Date.now()
      }],
      boardDeletion: 'admin'
    })
    const board = await createBoard({
      owner,
      workspaceId: workspace._id,
      type: 'workspace_visible'
    })
    const columnId = new ObjectId()
    const cardId = new ObjectId()
    await db.collection('columns').insertOne({
      _id: columnId,
      boardId: board._id,
      title: 'Column',
      cardOrderIds: [cardId],
      _destroy: false
    })
    await db.collection('cards').insertOne({
      _id: cardId,
      boardId: board._id,
      columnId,
      title: 'Card',
      attachments: [{
        publicId: 'card-attachments/integration-file',
        url: 'https://res.cloudinary.com/test/raw/upload/v1/card-attachments/integration-file.pdf',
        filename: 'integration-file.pdf'
      }],
      _destroy: false
    })
    await Promise.all([
      db.collection('labels').insertOne({
        _id: new ObjectId(),
        boardId: board._id,
        title: 'Label'
      }),
      db.collection('comments').insertOne({
        _id: new ObjectId(),
        cardId,
        userId: owner._id,
        content: 'Comment'
      }),
      db.collection('activities').insertOne({
        _id: new ObjectId(),
        cardId,
        userId: owner._id,
        content: 'Activity'
      }),
      db.collection('notifications').insertOne({
        _id: new ObjectId(),
        userId: owner._id,
        boardId: board._id,
        message: 'Notification'
      }),
      db.collection('invitations').insertOne({
        _id: new ObjectId(),
        inviterId: owner._id,
        inviteeId: member._id,
        boardInvitation: { boardId: board._id, status: 'PENDING' }
      })
    ])

    await request(app)
      .delete(`/v1/boards/${board._id}`)
      .set('Cookie', await authCookie(member))
      .expect(403)

    await request(app)
      .delete(`/v1/boards/${board._id}`)
      .set('Cookie', await authCookie(owner))
      .expect(200)

    expect(await db.collection('boards').findOne({ _id: board._id })).toBeNull()
    expect(await db.collection('columns').findOne({ _id: columnId })).toBeNull()
    expect(await db.collection('cards').findOne({ _id: cardId })).toBeNull()
    expect(await db.collection('labels').findOne({ boardId: board._id })).toBeNull()
    expect(await db.collection('comments').findOne({ cardId })).toBeNull()
    expect(await db.collection('activities').findOne({ cardId })).toBeNull()
    expect(await db.collection('notifications').findOne({ boardId: board._id })).toBeNull()
    expect(await db.collection('invitations').findOne({
      'boardInvitation.boardId': board._id
    })).toBeNull()
    expect(cloudinaryMocks.deleteResource)
      .toHaveBeenCalledWith('card-attachments/integration-file')
  })

  it('revokes direct board access in the same transaction when a member leaves', async () => {
    const owner = await createUser('owner-leave@example.com')
    const leaver = await createUser('member-leave@example.com')
    const workspace = await createWorkspace({
      owner,
      members: [{
        userId: leaver._id,
        email: leaver.email,
        role: 'member',
        status: 'active',
        inviteToken: null,
        joinedAt: Date.now()
      }]
    })
    const board = await createBoard({
      owner: leaver,
      workspaceId: workspace._id,
      type: 'workspace_visible',
      memberIds: [leaver._id]
    })
    await db.collection('boards').updateOne(
      { _id: board._id },
      { $set: { starredBy: [leaver._id] } }
    )

    await request(app)
      .post(`/v1/workspaces/${workspace._id}/leave`)
      .set('Cookie', await authCookie(leaver))
      .expect(200)

    const [updatedWorkspace, updatedBoard] = await Promise.all([
      db.collection('workspaces').findOne({ _id: workspace._id }),
      db.collection('boards').findOne({ _id: board._id })
    ])
    const remainingMemberIds = updatedWorkspace.members
      .filter(member => member.userId)
      .map(member => member.userId.toString())

    expect(remainingMemberIds).not.toContain(leaver._id.toString())
    expect(updatedBoard.ownerIds.map(id => id.toString())).toEqual([owner._id.toString()])
    expect(updatedBoard.memberIds.map(id => id.toString())).not.toContain(leaver._id.toString())
    expect(updatedBoard.starredBy.map(id => id.toString())).not.toContain(leaver._id.toString())
  })

  it('deletes a card, its child records and its unreferenced Cloudinary assets', async () => {
    const owner = await createUser('owner-delete-card@example.com')
    const board = await createBoard({ owner })
    const columnId = new ObjectId()
    const cardId = new ObjectId()
    await db.collection('columns').insertOne({
      _id: columnId,
      boardId: board._id,
      title: 'Column',
      cardOrderIds: [cardId],
      _destroy: false
    })
    await db.collection('cards').insertOne({
      _id: cardId,
      boardId: board._id,
      columnId,
      title: 'Card',
      attachments: [{
        publicId: 'card-attachments/card-delete-file',
        url: 'https://res.cloudinary.com/test/raw/upload/v1/card-attachments/card-delete-file.pdf'
      }],
      _destroy: false
    })
    await Promise.all([
      db.collection('comments').insertOne({
        _id: new ObjectId(),
        cardId,
        userId: owner._id,
        content: 'Comment'
      }),
      db.collection('activities').insertOne({
        _id: new ObjectId(),
        cardId,
        userId: owner._id,
        content: 'Activity'
      })
    ])

    await request(app)
      .delete(`/v1/cards/${cardId}`)
      .set('Cookie', await authCookie(owner))
      .expect(200)

    const updatedColumn = await db.collection('columns').findOne({ _id: columnId })
    expect(updatedColumn.cardOrderIds).toEqual([])
    expect(await db.collection('cards').findOne({ _id: cardId })).toBeNull()
    expect(await db.collection('comments').findOne({ cardId })).toBeNull()
    expect(await db.collection('activities').findOne({ cardId })).toBeNull()
    expect(cloudinaryMocks.deleteResource)
      .toHaveBeenCalledWith('card-attachments/card-delete-file')
  })

  it('deletes and clears columns without leaving card children behind', async () => {
    const owner = await createUser('owner-delete-column@example.com')
    const board = await createBoard({ owner })
    const deletedColumnId = new ObjectId()
    const clearedColumnId = new ObjectId()
    const deletedCardId = new ObjectId()
    const clearedCardId = new ObjectId()
    await db.collection('boards').updateOne(
      { _id: board._id },
      { $set: { columnOrderIds: [deletedColumnId, clearedColumnId] } }
    )
    await db.collection('columns').insertMany([
      {
        _id: deletedColumnId,
        boardId: board._id,
        title: 'Delete column',
        cardOrderIds: [deletedCardId],
        _destroy: false
      },
      {
        _id: clearedColumnId,
        boardId: board._id,
        title: 'Clear column',
        cardOrderIds: [clearedCardId],
        _destroy: false
      }
    ])
    await db.collection('cards').insertMany([
      {
        _id: deletedCardId,
        boardId: board._id,
        columnId: deletedColumnId,
        title: 'Deleted card',
        _destroy: false
      },
      {
        _id: clearedCardId,
        boardId: board._id,
        columnId: clearedColumnId,
        title: 'Cleared card',
        _destroy: false
      }
    ])
    await db.collection('comments').insertMany([
      { _id: new ObjectId(), cardId: deletedCardId, content: 'Delete me' },
      { _id: new ObjectId(), cardId: clearedCardId, content: 'Clear me' }
    ])

    await request(app)
      .delete(`/v1/columns/${deletedColumnId}`)
      .set('Cookie', await authCookie(owner))
      .expect(200)
    await request(app)
      .delete(`/v1/columns/clear-cards/${clearedColumnId}`)
      .set('Cookie', await authCookie(owner))
      .expect(200)

    const [updatedBoard, clearedColumn] = await Promise.all([
      db.collection('boards').findOne({ _id: board._id }),
      db.collection('columns').findOne({ _id: clearedColumnId })
    ])
    expect(await db.collection('columns').findOne({ _id: deletedColumnId })).toBeNull()
    expect(updatedBoard.columnOrderIds.map(id => id.toString()))
      .toEqual([clearedColumnId.toString()])
    expect(clearedColumn.cardOrderIds).toEqual([])
    expect(await db.collection('cards').countDocuments({
      _id: { $in: [deletedCardId, clearedCardId] }
    })).toBe(0)
    expect(await db.collection('comments').countDocuments({
      cardId: { $in: [deletedCardId, clearedCardId] }
    })).toBe(0)
  })

  it('deletes a workspace and every owned child collection in one transaction', async () => {
    const owner = await createUser('owner-delete-workspace@example.com')
    const workspace = await createWorkspace({ owner })
    const board = await createBoard({
      owner,
      workspaceId: workspace._id,
      type: 'workspace_visible'
    })
    const columnId = new ObjectId()
    const cardId = new ObjectId()
    await db.collection('columns').insertOne({
      _id: columnId,
      boardId: board._id,
      cardOrderIds: [cardId]
    })
    await db.collection('cards').insertOne({
      _id: cardId,
      boardId: board._id,
      columnId,
      title: 'Workspace card'
    })
    await Promise.all([
      db.collection('comments').insertOne({
        _id: new ObjectId(),
        cardId,
        content: 'Workspace comment'
      }),
      db.collection('workspace_activities').insertOne({
        _id: new ObjectId(),
        workspaceId: workspace._id,
        content: 'Workspace activity'
      }),
      db.collection('notifications').insertOne({
        _id: new ObjectId(),
        workspaceId: workspace._id,
        boardId: board._id,
        message: 'Workspace notification'
      })
    ])

    await request(app)
      .delete(`/v1/workspaces/${workspace._id}`)
      .set('Cookie', await authCookie(owner))
      .expect(200)

    expect(await db.collection('workspaces').findOne({ _id: workspace._id })).toBeNull()
    expect(await db.collection('boards').findOne({ _id: board._id })).toBeNull()
    expect(await db.collection('columns').findOne({ _id: columnId })).toBeNull()
    expect(await db.collection('cards').findOne({ _id: cardId })).toBeNull()
    expect(await db.collection('comments').findOne({ cardId })).toBeNull()
    expect(await db.collection('workspace_activities').findOne({
      workspaceId: workspace._id
    })).toBeNull()
    expect(await db.collection('notifications').findOne({
      workspaceId: workspace._id
    })).toBeNull()
  })
})
