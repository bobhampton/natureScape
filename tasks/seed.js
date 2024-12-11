import { dbConnection, closeConnection } from '../config/mongoConnection.js'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { photos, locations, users } from '../config/mongoCollections.js'
import sharp from 'sharp'
import exifReader from 'exif-reader'
import { findKeys, latLonToDecimal } from '../routes/helpers.js'
import usersData from '../data/users.js'
import { seedUsers } from './seedUsers.js'
import { seedImages } from './seedImages.js'
import { seedComments } from './seedComments.js'



const db = await dbConnection()
await db.dropDatabase()





const runSeed = async () => {
  await seedUsers()
  await seedImages()
  await seedComments()
  await closeConnection()
  console.log('Done!')
} //End of runSeed

// Run the seed function (main if you will...)
runSeed();
