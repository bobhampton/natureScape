import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { photos, users } from '../config/mongoCollections.js'
//import { findKeys, latLonToDecimal } from '../routes/helpers.js'
import { findLocationId, addLocation } from './seedLocations.js'
import reverse from 'reverse-geocode'
import { lookUpRaw, lookUp, lookUpGeoJSON } from 'geojson-places'
import { addMetadata } from './seedMetadata.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to seed images
export const seedImages = async () => {

  const imageFolder = path.join(__dirname, '../seed_images')
  const imageFiles = fs.readdirSync(imageFolder)

  let userNum = 0
  let fileNum = 1
  let fileNameInput
  let fileName
  let takenYear
  let takenMonth
  let takenDay
  let maxTopFive = 5
  let metaSeedIN = {
    imagePath: '',
    area: '',
    latitude: 0,
    longitude: 0,
    createDate: '',
    DocumentName: ''
  }

  console.log('Seeding images/locations...')

  // 1 degree of lat is approximately 69 miles (111 km)
  let heading = 254.52317809400603
  const manualLatLon = {
    // Congaree National Park, SC, US
    ccSC: {
      latitude: 33.83037368257592,
      longitude: -80.82370672901854,
      state: 'SC',
      country: 'US',
      area: 'Congaree National Park'
    },
    // Capitol Reef National Park, UT, US
    crUT: {
      latitude: 38.18535,
      longitude: -111.1785,
      state: 'UT',
      country: 'US',
        area: 'Capitol Reef National Park'
    },
    // Orchard Glen, ND, US
    ogND: {
      latitude: 46.775901224709,
      longitude: -96.787450748989,
      state: 'ND',
      country: 'US',
        area: 'Orchard Glen'
    },
    // Red Rock Canyon State Park, CA, US
    rrCA: {
      latitude: 35.373601,
      longitude: -117.993204,
      state: 'CA',
      country: 'US',
        area: 'Red Rock Canyon State Park'
    },
    // Steinaker State Park, UT, US
    ssUT: {
      latitude: 40.51582,
      longitude: -109.53892,
      state: 'UT',
      country: 'US',
        area: 'Steinaker State Park'
    },
    // False Bay Nature Reserve. Grassy Park, Cape Town, ZA
    fbZA: {
      latitude: -34.05902,
      longitude: 18.499532,
      state: 'Western Cape',
      country: 'ZA',
      area: 'Grassy Park'
    },
    // Helderberg Nature Reserve dam. Somerset West, Cape Town, ZA
    hnZA: {
      latitude: -34.06295,
      longitude: 18.87208,
      state: 'Western Cape',
      country: 'ZA',
      area: 'Somerset West'
    },
    // Lettmair Au, Austria. Admont, AT
    laAT: {
      latitude: 47.582506,
      longitude: 14.587522,
      state: 'Styria',
      country: 'AT',
      area: 'Admont'
    },
    // Best Kept Secret Cheshire, UK. Frodsham, UK
    bkGB: {
      latitude: 53.255201,
      longitude: -2.74744,
      state: 'Cheshire',
      country: 'GB',
        area: 'Frodsham'
    },
    // Maglemosen genopstår, Denmark. Farum, DK
    mgDK: {
      latitude: 55.80663,
      longitude: 12.30903,
      state: 'Capital Region',
      country: 'DK',
        area: 'Farum'
    },
    // Skalanes. Múlaþing, IS
    smIS: {
      latitude: 65.294782,
      longitude: -13.701698,
      state: 'Eastern Region',
      country: 'IS',
        area: 'Múlaþing'
    },
    // Sheridan Glacier. AK, US
    agAK: {
      latitude: 60.53176,
      longitude: -145.37783,
      state: 'AK',
      country: 'US',
      area: 'Sheridan Glacier'
    },
    // Keālia Kanuimanu Ponds. HI, US
    kkHI: {
      latitude: 20.794749,
      longitude: -156.473163,
      state: 'HI',
      country: 'US',
      area: 'Keālia Kanuimanu Ponds'
    },
  crAK: {
    latitude: 59.230213,
    longitude: -135.484234,
    state: 'AK',
    country: 'US',
    area: 'Chilkat River'
  },
  htAK: {
    latitude: 60.45379213,
    longitude: -145.28203585,
    state: 'AK',
    country: 'US',
    area: 'Haystack Trail Overlook'
  },
  spAU: {
    latitude: -37.847548,
    longitude: 144.898002,
    state: 'Victoria',
    country: 'AU',
    area: 'Sandy Point wetland revegetation'
  },
  sbAU: {
    latitude: -38.2273,
    longitude: 144.6517,
    state: 'Victoria',
    country: 'AU',
    area: 'Swan Bay wetland restoration'
  }
  }

  console.log('*****')
  console.log('Adding metadata to images. This takes a while...')

  for (const file of imageFiles) {
    const filePath = path.join(imageFolder, file)
    const fileExtension = path.extname(file).toLowerCase()

    // For addMetadata function (imagePath, area, latitude, longitude, createDate)
    metaSeedIN.imagePath = filePath

    // Filter out non-image files like .DS_Store >_<
    if (!['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(fileExtension)) {
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
      fileNameInput = file.split('_')
      fileNameInput = fileNameInput[0].split('-')
      if (fileName === fileNameInput[0]) {
        fileNum++
      } else {
        fileNum = 1
      }
      fileName = fileNameInput[0]
      newPhoto.photo_name = `${fileName}${fileNum}`

      takenYear = fileNameInput[1]
      takenMonth = fileNameInput[2]
      takenDay = fileNameInput[3]

      // Set the date taken
      newPhoto.date_time_taken = new Date(takenYear, takenMonth - 1, takenDay) // apparently month is 0-indexed

      // For addMetadata function (xxximagePath, area, latitude, longitude, xxxcreateDate)
      metaSeedIN.createDate = `${takenYear}:${takenMonth}:${takenDay} 00:00:00`

      // Check if location already exists in database
      if (fileName in manualLatLon) {
        let location = await findLocationId(
          manualLatLon[fileName].area,
          manualLatLon[fileName].state
        )

        metaSeedIN.area = manualLatLon[fileName].area
        metaSeedIN.latitude = manualLatLon[fileName].latitude
        metaSeedIN.longitude = manualLatLon[fileName].longitude

        /* 
          ************************************************************************
          *********************** ADDING METADATA TO SEED_IMAGES *****************
          ************************************************************************
                                                                                 
          args:

          metaSeedIN = {
            imagePath: filePath, 
            area: manualLatLon[fileName].area, 
            latitude: manualLatLon[fileName].latitude, 
            longitude: manualLatLon[fileName].longitude, 
            createDate: `${takenYear}:${takenMonth}:${takenDay} 00:00:00`
          }

          ************************************************************************
          ************************************************************************
          ************************************************************************
        */
        let metaSeedOUT = await addMetadata(
          metaSeedIN.imagePath, 
          metaSeedIN.area, 
          metaSeedIN.latitude, 
          metaSeedIN.longitude, 
          metaSeedIN.createDate
        )

        //console.log('\n\nMetadata added to image:', metaSeedOUT)

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
            //manualLatLon[fileName].area = reverseGeo.city // Can change this to city if needed?
            //manualLatLon[fileName].area = reverseGeo.zipcode

            // Add location to database
            location = await addLocation(
              manualLatLon[fileName].country,
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
                manualLatLon[fileName].country,
              manualLatLon[fileName].state,
              null,
              manualLatLon[fileName].area
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

    //console.log('Metadata successfully added to images...')

    // Get the current time in UTC
    const temp = Date.now()
    const uploadTimeStampUTC = new Date(temp)

    // Set the new photo object properties

    newPhoto.photo_description =
      'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ',
      newPhoto.date_time_uploaded = uploadTimeStampUTC,
      newPhoto.img = {
        data: Buffer.from(fileData),
        contentType: contentType
      }

    // Set the user_id for the photo
    const userCollection = await users()
    const allUsers = await userCollection.find({}).toArray()

    if (userNum >= allUsers.length) {
      userNum = 0
    } else {
      newPhoto.user_id = allUsers[userNum]._id
      userNum++
    }

    // Randomly select between 0-5 likes & views to add to the photo
    const randomLikes = Math.floor(Math.random() * 5)
    const randomViews = Math.floor(Math.random() * (25 - 5 + 1)) + 5;

    if (randomViews === 0 && randomViews < randomLikes) {
      newPhoto.views = randomLikes * 8
    }
    if (randomViews < randomLikes) {
      newPhoto.views = randomLikes * 5
    }

    newPhoto.likes = randomLikes
    newPhoto.views = randomViews

    try {
      const imageCollection = await photos()
      await imageCollection.insertOne(newPhoto)
      //console.log(`Image ${file} saved to database`) //debugging
    } catch (e) {
      console.error(`Error saving image ${file}:`, e)
    }
  }

  // Randomly choose 5 photos for extra likes/views
  const imageCollection = await photos()
  const allImages = await imageCollection.find({}).toArray()

  for (let i = 0; i < maxTopFive; i++) {
    const topFiveMultiplier = Math.floor(Math.random() * 5) + 5
    const randomImage = Math.floor(Math.random() * allImages.length)
    const randomLikes = (allImages[randomImage].likes * topFiveMultiplier)
    const randomViews = (allImages[randomImage].views * topFiveMultiplier)

    try {
      await imageCollection.updateOne(
        { _id: allImages[randomImage]._id },
        { $inc: { likes: randomLikes, views: randomViews } }
      )
      //console.log(`Image ${allImages[randomImage]._id} updated with ${randomLikes} likes and ${randomViews} views`) //debugging
    } catch (e) {
      console.error(`Error updating image ${allImages[randomImage]._id}:`, e)
    }

  }

  console.log('******')
  console.log('Metadata successfully added to images...')


  /* 
    ************************************************************************
    *********************** ADDING METADATA TO TEST_IMAGES *****************
    ************************************************************************
  */

  // Add metadata to test photos from the 'test_images' folder without adding them to the database
  const testImageFolder = path.join(__dirname, '../test_images')
  const testImageFiles = fs.readdirSync(testImageFolder)

  console.log('*******')
  console.log('Adding metadata to test images. This takes a while...')

  for (const file of testImageFiles) {
    const filePath = path.join(testImageFolder, file)
    const fileExtension = path.extname(file).toLowerCase()

    // For addMetadata function (imagePath, area, latitude, longitude, createDate)
    metaSeedIN.imagePath = filePath

    // Filter out non-image files like .DS_Store >_<
    if (!['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(fileExtension)) {
      continue
    }

    // Split file name to extract date taken
    fileNameInput = file.split('_')
    fileNameInput = fileNameInput[0].split('-')
    fileName = fileNameInput[0]

    takenYear = fileNameInput[1]
    takenMonth = fileNameInput[2]
    takenDay = fileNameInput[3]

    // Set the date taken
    metaSeedIN.createDate = `${takenYear}:${takenMonth}:${takenDay} 00:00:00`

    // Check if location already exists in manualLatLon
    if (fileName in manualLatLon) {
      metaSeedIN.area = manualLatLon[fileName].area
      metaSeedIN.latitude = manualLatLon[fileName].latitude
      metaSeedIN.longitude = manualLatLon[fileName].longitude

      // Add metadata to the image
      let metaSeedOUT = await addMetadata(
        metaSeedIN.imagePath, 
        metaSeedIN.area, 
        metaSeedIN.latitude, 
        metaSeedIN.longitude, 
        metaSeedIN.createDate
      )

      //console.log('\n\nMetadata added to test image:', metaSeedOUT)
    }
  }
  console.log('********')
  console.log('Metadata successfully added to test images...')

  console.log('*********')
  console.log('Images/locations seeded successfully!')
  console.log('**********\n')
} //End of seedImages

