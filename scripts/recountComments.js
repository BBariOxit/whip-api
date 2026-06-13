/* eslint-disable no-console */
import 'dotenv/config'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '../src/config/mongodb.js'
import { ObjectId } from 'mongodb'

const recountComments = async () => {
  try {
    console.log('1. Connecting to Database...')
    await CONNECT_DB()
    const db = GET_DB()
    const cardsCollection = db.collection('cards')
    const commentsCollection = db.collection('comments')

    const allCards = await cardsCollection.find({}).toArray()
    let updatedCount = 0

    for (const card of allCards) {
      const commentCount = await commentsCollection.countDocuments({ cardId: card._id })
      if (commentCount > 0) {
        await cardsCollection.updateOne(
          { _id: card._id },
          { $set: { totalComments: commentCount } }
        )
        updatedCount++
      }
    }

    console.log(`Updated totalComments for ${updatedCount} cards.`)
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await CLOSE_DB()
    process.exit(0)
  }
}

recountComments()
