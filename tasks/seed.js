import { dbConnection, closeConnection } from '../config/mongoConnection.js'
import { photos, locations, users } from '../config/mongoCollections.js'
import { seedUsers } from './seedUsers.js'
import { seedImages } from './seedImages.js'
import { seedComments } from './seedComments.js'
import { lookUpRaw, lookUp, lookUpGeoJSON } from 'geojson-places'
// import wikidataLookup from 'wikidata-entity-lookup'



const db = await dbConnection()
await db.dropDatabase()

const lookup = async (latitude, longitude) => {
  const geoLookUpRaw = await lookUpRaw(latitude, longitude)
  console.log(geoLookUpRaw)
}

const test = async () => {

  const photoIndex = 11

  const photosCollection = await photos()
  const photo = await photosCollection.find({}).toArray()

  let geoLookUpRaw = await lookUpRaw(photo[photoIndex].location.latitude, photo[photoIndex].location.longitude)

  console.log('\n\n***** TESTING *****')
  console.log('\nphoto name: ', photo[photoIndex].photo_name)
  //console.log('geoLookUpRaw: ', geoLookUpRaw)
  console.dir(geoLookUpRaw, {depth: null})
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

  //await test()


  await closeConnection()
} //End of runSeed

// Run the seed function (main if you will...)
runSeed();
