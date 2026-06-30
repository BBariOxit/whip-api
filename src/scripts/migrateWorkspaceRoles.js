/**
 * Migration Script: Chuyển workspace từ schema cũ (ownerId + memberIds) sang schema mới (members array)
 * 
 * Chạy 1 lần duy nhất bằng: node -r @babel/register src/scripts/migrateWorkspaceRoles.js
 * 
 * Schema cũ:
 *   { ownerId: ObjectId, memberIds: [ObjectId, ...] }
 * 
 * Schema mới:
 *   { members: [{ userId: ObjectId, role: 'owner'|'admin'|'member', joinedAt: Number }, ...] }
 */

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

const MONGODB_URI = env.MONGODB_URI
const DATABASE_NAME = env.DATABASE_NAME

const migrate = async () => {
  console.log('🚀 Starting workspace RBAC migration...')

  const client = new MongoClient(MONGODB_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  })

  try {
    await client.connect()
    const db = client.db(DATABASE_NAME)
    const usersCollection = db.collection('users')
    const workspacesCollection = db.collection('workspaces')

    // Lấy tất cả workspace chưa migrate (có field ownerId)
    // HOẶC workspace đã migrate nhưng members thiếu email (để backfill email cho data cũ)
    const workspacesToMigrate = await workspacesCollection.find({
      $or: [
        { ownerId: { $exists: true } },
        { 'members.email': { $exists: false } }
      ]
    }).toArray()

    console.log(`📋 Found ${workspacesToMigrate.length} workspace(s) to migrate or backfill.`)

    if (workspacesToMigrate.length === 0) {
      console.log('✅ No workspaces need migration. All good!')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const ws of workspacesToMigrate) {
      try {
        const members = []
        
        // Nếu workspace cũ (chưa migrate lần nào) thì lấy ownerId/memberIds
        // Nếu workspace đã migrate rồi nhưng thiếu email thì duyệt mảng members cũ
        
        if (ws.ownerId || ws.memberIds) {
          // TRƯỜNG HỢP 1: TỪ FLAT SCHEMA CŨ
          const processedUserIds = new Set()

          if (ws.ownerId) {
            const ownerIdStr = ws.ownerId.toString()
            const user = await usersCollection.findOne({ _id: ws.ownerId })
            members.push({
              userId: ws.ownerId,
              email: user ? user.email : 'unknown@example.com',
              role: 'owner',
              status: 'active',
              inviteToken: null,
              joinedAt: ws.createdAt || Date.now()
            })
            processedUserIds.add(ownerIdStr)
          }

          if (ws.memberIds && Array.isArray(ws.memberIds)) {
            for (const memberId of ws.memberIds) {
              const memberIdStr = memberId.toString()
              if (!processedUserIds.has(memberIdStr)) {
                const user = await usersCollection.findOne({ _id: memberId })
                members.push({
                  userId: memberId,
                  email: user ? user.email : 'unknown@example.com',
                  role: 'member',
                  status: 'active',
                  inviteToken: null,
                  joinedAt: ws.createdAt || Date.now()
                })
                processedUserIds.add(memberIdStr)
              }
            }
          }
        } else if (ws.members && Array.isArray(ws.members)) {
          // TRƯỜNG HỢP 2: ĐÃ MIGRATE NHƯNG THIẾU EMAIL
          for (const member of ws.members) {
            if (member.userId && !member.email) {
              const user = await usersCollection.findOne({ _id: member.userId })
              members.push({
                ...member,
                email: user ? user.email : 'unknown@example.com',
                status: member.status || 'active',
                inviteToken: member.inviteToken || null
              })
            } else {
              members.push({
                ...member,
                status: member.status || 'active',
                inviteToken: member.inviteToken || null
              })
            }
          }
        }

        // 3. Update document: set members, unset ownerId + memberIds
        await workspacesCollection.updateOne(
          { _id: ws._id },
          {
            $set: { members: members, updatedAt: Date.now() },
            $unset: { ownerId: '', memberIds: '' }
          }
        )

        successCount++
        console.log(`  ✅ Migrated workspace "${ws.title}" (${ws._id}) — ${members.length} member(s)`)
      } catch (err) {
        errorCount++
        console.error(`  ❌ Failed to migrate workspace "${ws.title}" (${ws._id}):`, err.message)
      }
    }

    console.log(`\n🏁 Migration complete: ${successCount} success, ${errorCount} failed.`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await client.close()
    console.log('🔌 Database connection closed.')
  }
}

migrate()
