import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
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
      _destroy: false
    })

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
})
