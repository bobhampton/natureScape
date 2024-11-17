import { dbConnection, closeConnection } from '../config/mongoConnection.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { photos } from '../config/mongoCollections.js'
import sharp from 'sharp'
import exifReader from 'exif-reader'
import { findKeys, latLonToDecimal } from '../routes/helpers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const db = await dbConnection()
await db.dropDatabase()

const seedImages = async () => {
  console.log('Seeding images...')
  const imageFolder = path.join(__dirname, '../seed_images')
  const imageFiles = fs.readdirSync(imageFolder)

  /* 
    1 degree of lat is approximately 69 miles (111 km)

    lon is measured as an angle from the Prime Meridian (0 degrees) 
    to 180 degrees east or west. So a degree of lon represents smaller 
    distances at higher altitudes.

    Let's keep it simple and just add 3 degrees to the lat to make the
    second location ~200 miles away from the first.

    crUT1/2 is Capitol Reef National Park, Utah
    cSC1/2 is Congaree National Park, South Carolina
    ogND1/2 is Orchard Glen, North Dakota
    rrCA1/2 is Red Rock Canyon State Park, California
    sUT1/2 is Steinaker State Park, Utah
  */
  const manualLatLon = {
    ccSC1: { latitude: 33.83037368257592, longitude: -80.82370672901854 },
    crUT1: { latitude: 38.18535, longitude: -111.17850 },
    ogND1: { latitude: 46.775901224709, longitude: -96.787450748989 },
    rrCA1: { latitude: 35.373601, longitude: -117.993204 },
    ssUT1: { latitude: 40.51582, longitude: -109.53892 }
  }

  // Add 3 degrees to the latitude and add second location to the object
  manualLatLon.ccSC2 = { latitude: manualLatLon.ccSC1.latitude + 3, longitude: manualLatLon.ccSC1.longitude }
  manualLatLon.crUT2 = { latitude: manualLatLon.crUT1.latitude + 3, longitude: manualLatLon.crUT1.longitude }
  manualLatLon.ogND2 = { latitude: manualLatLon.ogND1.latitude + 3, longitude: manualLatLon.ogND1.longitude }
  manualLatLon.rrCA2 = { latitude: manualLatLon.rrCA1.latitude + 3, longitude: manualLatLon.rrCA1.longitude }
  manualLatLon.ssUT2 = { latitude: manualLatLon.ssUT1.latitude + 3, longitude: manualLatLon.ssUT1.longitude }

  for (const file of imageFiles) {
    const filePath = path.join(imageFolder, file)
    const fileExtension = path.extname(file).toLowerCase()

    // Filter out non-image files like .DS_Store >_<
    if (!['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(fileExtension)) {
      console.log(`Non-image file ${file} found, skipping...`)
      continue
    }

    const fileData = fs.readFileSync(filePath)
    const contentType = 'image/' + fileExtension.slice(1)

    let metadata = {}

    try {
      // Extract metadata from the image using sharp
      const image = sharp(fileData)
      metadata = await image.metadata()

      // Convert EXIF to display in Compass
      if (metadata.exif) {
        metadata.exif = exifReader(metadata.exif)
      }

      const gpsKeys = [
        'GPSLatitude',
        'GPSLongitude',
        'GPSLatitudeRef',
        'GPSLongitudeRef'
      ]

      // See if we got dem keys we need
      const gpsData = findKeys(metadata, gpsKeys)

      // Convert GPS coordinates to decimal format
      if (Object.keys(gpsData).length !== 0) {
        if (
          gpsData.GPSLatitude &&
          gpsData.GPSLongitude &&
          gpsData.GPSLatitudeRef &&
          gpsData.GPSLongitudeRef
        ) {
          const lat = gpsData.GPSLatitude
          const lon = gpsData.GPSLongitude
          const latRef = gpsData.GPSLatitudeRef
          const lonRef = gpsData.GPSLongitudeRef
          const { latitude, longitude } = latLonToDecimal(
            lat,
            lon,
            latRef,
            lonRef
          )
  
          metadata.latitudeDecimal = latitude
          metadata.longitudeDecimal = longitude
        }
      } else {
        // Add manual lat/lon to photos that don't have GPS metadata
        let fileName = file.slice(0, 5)
        if (fileName in manualLatLon) {
          metadata.latitudeDecimal = manualLatLon[fileName].latitude
          metadata.longitudeDecimal = manualLatLon[fileName].longitude
        }
      }
    } catch (err) {
      console.error('Error extracting metadata:', err)
    }

    // Get the current time in UTC
    const uploadTimeStampUTC = Date.now()

    // Create a new image document
    const newImage = {
      name: path.basename(file, fileExtension),
      desc: 'Seed image',
      uploadTimeStampUTC,
      img: {
        data: Buffer.from(fileData),
        contentType: contentType
      },
      metadata // Store the extracted metadata
    }

    try {
      const imageCollection = await photos()
      await imageCollection.insertOne(newImage)
      console.log(`Image ${file} saved to database`)
    } catch (err) {
      console.error(`Error saving image ${file}:`, err)
    }
  }
}

const runSeed = async () => {
  await seedImages()
  await closeConnection()
  console.log('Done!')
}

runSeed()
