import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '../config/environment'

const MONGODB_URI = env.MONGODB_URI
const DATABASE_NAME = env.DATABASE_NAME

const migrate = async () => {
  console.log('🚀 Starting backfill status migration...')
  const client = new MongoClient(MONGODB_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  })

  try {
    await client.connect()
    const db = client.db(DATABASE_NAME)
    const workspacesCollection = db.collection('workspaces')

    const workspaces = await workspacesCollection.find({}).toArray()
    let count = 0

    for (const ws of workspaces) {
      if (ws.members) {
        let changed = false
        const updatedMembers = ws.members.map(m => {
          if (!m.status) {
            changed = true
            return { ...m, status: 'active' }
          }
          return m
        })
        if (changed) {
          await workspacesCollection.updateOne({ _id: ws._id }, { $set: { members: updatedMembers } })
          count++
          console.log(`Updated workspace ${ws._id}`)
        }
      }
    }

    console.log(`🏁 Migration complete: Updated ${count} workspaces.`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await client.close()
  }
}

migrate()
