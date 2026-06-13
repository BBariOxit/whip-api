/* eslint-disable no-console */
import 'dotenv/config'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '../src/config/mongodb.js'
import { ObjectId } from 'mongodb'

const migrateComments = async () => {
  try {
    console.log('1. Connecting to Database...')
    await CONNECT_DB()
    console.log('Connected successfully.')

    const db = GET_DB()
    const cardsCollection = db.collection('cards')
    const commentsCollection = db.collection('comments')

    console.log('2. Finding cards with legacy comments...')
    // Find cards that have a 'comments' array with at least 1 element
    const cardsWithComments = await cardsCollection.find({ 
      comments: { $exists: true, $type: 'array', $not: { $size: 0 } } 
    }).toArray()

    if (cardsWithComments.length === 0) {
      console.log('No legacy comments found. Migration is skipped.')
    } else {
      console.log(`Found ${cardsWithComments.length} cards with legacy comments. Starting migration...`)
      
      let totalMigrated = 0

      for (const card of cardsWithComments) {
        const legacyComments = card.comments
        
        // Prepare new comments data
        const newCommentsData = legacyComments.map(comment => {
          return {
            _id: new ObjectId(), // Generate a new proper _id
            cardId: card._id,
            userId: new ObjectId(comment.userId),
            userEmail: comment.userEmail || '',
            userAvatar: comment.userAvatar || null,
            userDisplayName: comment.userDisplayName || 'Unknown User',
            content: comment.content || '',
            parentId: null, // Legacy comments had no parentId (1-level nesting wasn't there yet)
            replyCount: 0,
            createdAt: comment.commentedAt ? new Date(comment.commentedAt) : new Date(),
            updatedAt: null,
            _destroy: false
          }
        })

        // Insert into the new comments collection
        if (newCommentsData.length > 0) {
          await commentsCollection.insertMany(newCommentsData)
          totalMigrated += newCommentsData.length
        }
      }

      console.log(`Successfully migrated ${totalMigrated} comments into the 'comments' collection!`)
    }

    console.log('3. Cleaning up legacy comments from cards...')
    // Unset the comments field from ALL cards to free up 16MB document size limit
    const cleanupResult = await cardsCollection.updateMany(
      { comments: { $exists: true } },
      { $unset: { comments: '' } }
    )
    
    console.log(`Cleaned up 'comments' field from ${cleanupResult.modifiedCount} cards.`)

    console.log('MIGRATION COMPLETED SUCCESSFULLY!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await CLOSE_DB()
    process.exit(0)
  }
}

migrateComments()
