import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { photos, users } from '../config/mongoCollections.js'
import sharp from 'sharp'
import exifReader from 'exif-reader'
import { findKeys, latLonToDecimal } from '../routes/helpers.js'
import { findLocationId, addLocation } from './seedLocations.js'
import reverse from 'reverse-geocode'
import { lookUpRaw, lookUp, lookUpGeoJSON } from 'geojson-places'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let userNum = 0

// Function to seed images
export const seedImages = async () => {
  console.log('Seeding images/locations...')
  const imageFolder = path.join(__dirname, '../seed_images')
  const imageFiles = fs.readdirSync(imageFolder)

  // 1 degree of lat is approximately 69 miles (111 km)
  let heading = 254.52317809400603
  const manualLatLon = {
    ccSC: {
      latitude: 33.83037368257592,
      longitude: -80.82370672901854
    },
    crUT1: {
      latitude: 38.18535,
      longitude: -111.1785
    },
    ogND1: {
      latitude: 46.775901224709,
      longitude: -96.787450748989
    },
    rrCA1: {
      latitude: 35.373601,
      longitude: -117.993204
    },
    ssUT1: {
      latitude: 40.51582,
      longitude: -109.53892
    }
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
      views: 0,
      verification_rating: 0,
      location: {
        latitude: null,
        longitude: null,
        heading,
        location_id: null
      },
      img: {
        contentType: null,
        data: null
      }
    }

    // Add manual data to photo
    try {
      // Split file name to extract date taken
      let fileNameInput = file.split('_')
      fileNameInput = fileNameInput[0].split('-')
      let fileName = fileNameInput[0]
      let takenYear = fileNameInput[1]
      let takenMonth = fileNameInput[2]
      let takenDay = fileNameInput[3]

      // Set the date taken
      newPhoto.date_time_taken = new Date(takenYear, takenMonth - 1, takenDay) // apparently month is 0-indexed

      // Check if location already exists in database
      if (fileName in manualLatLon) {
        let location = await findLocationId(
          manualLatLon[fileName].area,
          manualLatLon[fileName].state
        )

        // Use geojson-places to get country and state
        if (location === null) {
          let geoLookUp = lookUp(
            manualLatLon[fileName].latitude,
            manualLatLon[fileName].longitude
          )
          let stateCode = geoLookUp.state_code
          let splitStateCode = stateCode.split('-')
          let country = splitStateCode[0]
          let state = splitStateCode[1]

          // Check country to see if we can use reverse-geocode
          if (country === 'US' || country === 'CA' || country === 'AU') {
            let reverseGeo = reverse.lookup(
              manualLatLon[fileName].latitude,
              manualLatLon[fileName].longitude,
              `${country}`
            )

            // Use reverse-geocode to get state, city, and area
            manualLatLon[fileName].state = reverseGeo.state_abbr
            manualLatLon[fileName].city = reverseGeo.city
            manualLatLon[fileName].area = reverseGeo.city // Can change this to zip code if needed

            // Add location to database
            location = await addLocation(
              manualLatLon[fileName].state,
              manualLatLon[fileName].city,
              manualLatLon[fileName].area
            )
          } else {
            /* 
                Use geojson-places to get the state. Need to figure out how to get the city and area 
                if we don't limit input by country....
                */
            manualLatLon[fileName].state = state

            location = await addLocation(
              manualLatLon[fileName].state,
              null,
              null
            )
          }
        }

        newPhoto.location.location_id = location
        newPhoto.location.latitude = manualLatLon[fileName].latitude
        newPhoto.location.longitude = manualLatLon[fileName].longitude
        //newPhoto.location.heading = manualLatLon[fileName].heading
      }
    } catch (e) {
      console.error('Error extracting data from manualLatLon:', e)
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
    //newPhoto.metadata = metadata

    // Set the user_id for the photo
    const userCollection = await users()
    const allUsers = await userCollection.find({}).toArray()

    if (userNum >= allUsers.length) {
      userNum = 0
    } else {
      newPhoto.user_id = allUsers[userNum]._id
      userNum++
    }

    try {
      const imageCollection = await photos()
      await imageCollection.insertOne(newPhoto)
      //console.log(`Image ${file} saved to database`) //debugging
    } catch (e) {
      console.error(`Error saving image ${file}:`, e)
    }
  }
  console.log('Images/locations seeded successfully!\n')
} //End of seedImages
