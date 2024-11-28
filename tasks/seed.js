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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const db = await dbConnection()
await db.dropDatabase()

// Function to seed users
const seedUsers = async () => {
  console.log('Seeding users...')
  //Seeding users
  let user1;
  let user2;
  let user3;
  let user4;
  let user5;
  let saltRounds = 16

  try {
      // Create Users
    let userpassword = await bcrypt.hash("hashed_password_123", saltRounds);
    
    user1 = await usersData.createUser(
        "John",
        "Doe",
        "johndoe@gmail.com",
        "johndoe",
        userpassword
    );
    userpassword = await bcrypt.hash("hashed_password_456", saltRounds);
    user2 = await usersData.createUser(
        "Jane",
        "Smith",
        "janesmith@hotmail.com",
        "janesmith",
        userpassword
    );

    userpassword = await bcrypt.hash("hashed_password_789", saltRounds);
    user3 = await usersData.createUser(
        "Alice",
        "Johnson",
        "alicejohnson@yahoo.com",
        "alicejohnson",
        userpassword
    );

    userpassword = await bcrypt.hash("hashed_password_012", saltRounds);
    user4 = await usersData.createUser(
        "Donald",
        "Trump",
        "Donny@yahoo.com",
        "DJT",
        userpassword
    );

    userpassword = await bcrypt.hash("hashed_password_90210", saltRounds);
    user5 = await usersData.createUser(
        "Scott",
        "Mescudi",
        "KidCudi@gmail.com",
        "KidCudi",
        userpassword
    );

    console.log("Users created successfully!");
    //console.log("User 1:", user1);
    //console.log("User 2:", user2);
    //console.log("User 3:", user3);
    //console.log("User 4:", user3);
    //console.log("User 5:", user3);
  } catch (error) {
  console.error("Error while creating users:", error);
  }
}

// Function to find location id by area and state
const findLocationId = async (area, state) => {
  const locationsCollection = await locations()
  const location = await locationsCollection.findOne({
    area,
    state
  })

  if (!location) {
    //console.log(`Location ${area}, ${state} not found`) //debugging
    return null
  }

  return location._id
} //End of findLocationId

// Function to add location to database
const addLocation = async (state, city, area) => {
  const newLocation = {
    state,
    city,
    area
  }

  const locationsCollection = await locations()
  const insertInfo = await locationsCollection.insertOne(newLocation)

  if (insertInfo.insertedCount === 0) {
    throw 'Could not add location'
  } else {
    //console.log( `Location ${area}, ${state} added to the DB with id ${insertInfo.insertedId}`) //debugging
  }

  return insertInfo.insertedId
} //End of addLocation

// Function to seed images
const seedImages = async () => {
  console.log('Seeding images/locations...')
  const imageFolder = path.join(__dirname, '../seed_images')
  const imageFiles = fs.readdirSync(imageFolder)

  // 1 degree of lat is approximately 69 miles (111 km)
  let heading = 254.52317809400603
  const manualLatLon = {
    ccSC1: {
      area: 'Congaree National Park',
      state: 'SC',
      latitude: 33.83037368257592,
      longitude: -80.82370672901854,
      heading
    },
    crUT1: {
      area: 'Capitol Reef National Park',
      state: 'UT',
      latitude: 38.18535,
      longitude: -111.1785,
      heading
    },
    ogND1: {
      area: 'Orchard Glen',
      state: 'ND',
      latitude: 46.775901224709,
      longitude: -96.787450748989,
      heading
    },
    rrCA1: {
      area: 'Red Rock Canyon State Park',
      state: 'CA',
      latitude: 35.373601,
      longitude: -117.993204,
      heading
    },
    ssUT1: {
      area: 'Steinaker State Park',
      state: 'UT',
      latitude: 40.51582,
      longitude: -109.53892,
      heading
    }
  }

  // Add 3 degrees to the latitude and add second location to the object
  manualLatLon.ccSC2 = {
    area: manualLatLon.ccSC1.area,
    state: manualLatLon.ccSC1.state,
    latitude: manualLatLon.ccSC1.latitude + 3,
    longitude: manualLatLon.ccSC1.longitude,
    heading
  }
  manualLatLon.crUT2 = {
    area: manualLatLon.crUT1.area,
    state: manualLatLon.crUT1.state,
    latitude: manualLatLon.crUT1.latitude + 3,
    longitude: manualLatLon.crUT1.longitude,
    heading
  }
  manualLatLon.ogND2 = {
    area: manualLatLon.ogND1.area,
    state: manualLatLon.ogND1.state,
    latitude: manualLatLon.ogND1.latitude + 3,
    longitude: manualLatLon.ogND1.longitude,
    heading
  }
  manualLatLon.rrCA2 = {
    area: manualLatLon.rrCA1.area,
    state: manualLatLon.rrCA1.state,
    latitude: manualLatLon.rrCA1.latitude + 3,
    longitude: manualLatLon.rrCA1.longitude,
    heading
  }
  manualLatLon.ssUT2 = {
    area: manualLatLon.ssUT1.area,
    state: manualLatLon.ssUT1.state,
    latitude: manualLatLon.ssUT1.latitude + 3,
    longitude: manualLatLon.ssUT1.longitude,
    heading
  }

  for (const file of imageFiles) {
    const filePath = path.join(imageFolder, file)
    const fileExtension = path.extname(file).toLowerCase()

    // Filter out non-image files like .DS_Store >_<
    if (!['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(fileExtension)) {
      //console.log(`Non-image file ${file} found, skipping...`) //debugging
      continue
    }

    const fileData = fs.readFileSync(filePath)
    const contentType = 'image/' + fileExtension.slice(1)

    // Create a new photo object
    let newPhoto = {
      photo_name: null,
      photo_description: null,
      user_id: null,
      date_time_taken: null,
      date_time_uploaded: null,
      likes: 0,
      verification_rating: 0,
      location: {
        latitude: null,
        longitude: null,
        heading: null,
        location_id: null
      },
      img: {
        contentType: null,
        data: null
      }
    }

    let metadata = {}

    try {
      // Extract metadata from the image using sharp
      const image = sharp(fileData)
      metadata = await image.metadata()

      // Convert EXIF to display in Compass
      if (metadata.exif) {
        metadata.exif = exifReader(metadata.exif)
      }

      const searchKeys = [
        'GPSLatitude',
        'GPSLongitude',
        'GPSLatitudeRef',
        'GPSLongitudeRef',
        'GPSImgDirection',
        'DateTimeOriginal'
      ]
      /* 
        we might need these later?
        'GPSImgDirectionRef',
        'GPSAltitude',
        'GPSTimeStamp,
         */

      // See if we got dem keys we need
      const photoData = findKeys(metadata, searchKeys)

      // Convert GPS coordinates to decimal format
      if (Object.keys(photoData).length !== 0) {
        if (photoData.GPSImgDirection) {
          newPhoto.location.heading = photoData.GPSImgDirection
        }
        if (photoData.DateTimeOriginal) {
          newPhoto.date_time_taken = new Date(photoData.DateTimeOriginal)
        }
        if (
          photoData.GPSLatitude &&
          photoData.GPSLongitude &&
          photoData.GPSLatitudeRef &&
          photoData.GPSLongitudeRef
        ) {
          const lat = photoData.GPSLatitude
          const lon = photoData.GPSLongitude
          const latRef = photoData.GPSLatitudeRef
          const lonRef = photoData.GPSLongitudeRef
          const { latitude, longitude } = latLonToDecimal(
            lat,
            lon,
            latRef,
            lonRef
          )

          /*
          TODO:
          - Will need to implement a locationId lookup/creation 
            based on lat/lon once Vraj finishes how he wants to 
            define an area by lat/lon. For now, if photo has lat/lon
            they will be stored, but location_id will be null.
            */

          newPhoto.location.latitude = latitude
          newPhoto.location.longitude = longitude
        }
      } else {
        // Add manual lat/lon to photos that don't have GPS metadata
        let fileName = file.slice(0, 5)

        if (fileName in manualLatLon) {
          // Check if location exists in database
          let location = await findLocationId(
            manualLatLon[fileName].area,
            manualLatLon[fileName].state
          )

          // Add location to database if it doesn't exist
          if (location === null) {
            location = await addLocation(
              manualLatLon[fileName].state,
              null,
              manualLatLon[fileName].area
            )
          }
          newPhoto.location.location_id = location
          newPhoto.location.latitude = manualLatLon[fileName].latitude
          newPhoto.location.longitude = manualLatLon[fileName].longitude
          newPhoto.location.heading = manualLatLon[fileName].heading
        }
      }
    } catch (err) {
      console.error('Error extracting metadata:', err)
    }

    // Get the current time in UTC
    const temp = Date.now()
    const uploadTimeStampUTC = new Date(temp)

    // Set the new photo object properties
    ;(newPhoto.photo_name = path.basename(file, fileExtension)),
      (newPhoto.photo_description =
        'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'),
      (newPhoto.date_time_uploaded = uploadTimeStampUTC),
      (newPhoto.img = {
        data: Buffer.from(fileData),
        contentType: contentType
      })
    newPhoto.metadata = metadata // All captured metadata - Keeping this for now

    try {
      const imageCollection = await photos()
      await imageCollection.insertOne(newPhoto)
      //console.log(`Image ${file} saved to database`) //debugging
    } catch (err) {
      console.error(`Error saving image ${file}:`, err)
    }
  }
  console.log('Images/locations seeded successfully!\n')
} //End of seedImages

const runSeed = async () => {
  await seedImages()
  await seedUsers()
  await closeConnection()
  console.log('Done!')
} //End of runSeed

// Run the seed function (main if you will...)
runSeed();
