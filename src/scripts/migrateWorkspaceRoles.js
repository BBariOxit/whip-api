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
    const workspacesCollection = db.collection('workspaces')

    // Lấy tất cả workspace có schema cũ (có field ownerId)
    const oldWorkspaces = await workspacesCollection.find({
      ownerId: { $exists: true }
    }).toArray()

    console.log(`📋 Found ${oldWorkspaces.length} workspace(s) to migrate.`)

    if (oldWorkspaces.length === 0) {
      console.log('✅ No workspaces need migration. All good!')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const ws of oldWorkspaces) {
      try {
        const members = []
        const processedUserIds = new Set()

        // 1. Owner → role: 'owner'
        if (ws.ownerId) {
          const ownerIdStr = ws.ownerId.toString()
          members.push({
            userId: ws.ownerId,
            role: 'owner',
            joinedAt: ws.createdAt || Date.now()
          })
          processedUserIds.add(ownerIdStr)
        }

        // 2. memberIds (trừ owner) → role: 'member'
        if (ws.memberIds && Array.isArray(ws.memberIds)) {
          for (const memberId of ws.memberIds) {
            const memberIdStr = memberId.toString()
            if (!processedUserIds.has(memberIdStr)) {
              members.push({
                userId: memberId,
                role: 'member',
                joinedAt: ws.createdAt || Date.now()
              })
              processedUserIds.add(memberIdStr)
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
