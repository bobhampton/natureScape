import { dbConnection, closeConnection } from '../config/mongoConnection.js'
import { photos, locations, users } from '../config/mongoCollections.js'
import { seedUsers } from './seedUsers.js'
import { seedImages } from './seedImages.js'
import { seedComments } from './seedComments.js'
import { lookUpRaw, lookUp, lookUpGeoJSON } from 'geojson-places'

const db = await dbConnection()
await db.dropDatabase()

const lookup = async (latitude, longitude) => {
  const geoLookUpRaw = await lookUpRaw(latitude, longitude)
  console.log(geoLookUpRaw)
}

const runSeed = async () => {
  console.log('*')
  await seedUsers()
  console.log('****')
  await seedImages()
  console.log('***********')
  await seedComments()
  
  console.log('**************************')
  console.log('******* Seed done! *******')
  console.log('**************************\n')

  await closeConnection()
} //End of runSeed

// Run the seed function (main if you will...)
runSeed();
