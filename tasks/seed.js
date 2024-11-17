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
  */
  
  /* 
    crUT1/2 are Capitol Reef National Park, Utah
    cSC1/2 are Congaree National Park, South Carolina
    ogND1/2 are Orchard Glen, North Dakota
    rrCA1/2 are Red Rock Canyon State Park, California
    sUT1/2 are Steinaker State Park, Utah
  */
  const manualLatLon = {
    crUT1: { latitude: 38.3665, longitude: -111.2615 },
    //crUT2: { latitude: crUT1.latitude + 3, longitude: crUT1.longitude },
    ccSC1: { latitude: 33.8361, longitude: -116.5453 },
    //ccSC2: { latitude: ccSC1.latitude + 3, longitude: ccSC1.longitude },
    ogND1: { latitude: 48.7596, longitude: -101.4883 },
    //ogND2: { latitude: ogND1.latitude + 3, longitude: ogND1.longitude },
    rrCA1: { latitude: 34.0556, longitude: -116.1784 },
    //rrCA2: { latitude: rrCA1.latitude + 3, longitude: rrCA1.longitude },
    ssUT1: { latitude: 37.2982, longitude: -113.0263 },
    //ssUT2: { latitude: ssUT1.latitude + 3, longitude: ssUT1.longitude }
  }

  manualLatLon.crUT2 = { latitude: manualLatLon.crUT1.latitude + 3, longitude: manualLatLon.crUT1.longitude }
  manualLatLon.ccSC2 = { latitude: manualLatLon.ccSC1.latitude + 3, longitude: manualLatLon.ccSC1.longitude }
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

      // Convert GPS coordinates to decimal format
      const gpsKeys = [
        'GPSLatitude',
        'GPSLongitude',
        'GPSLatitudeRef',
        'GPSLongitudeRef'
      ]
      const gpsData = findKeys(metadata, gpsKeys)

      if (Object.keys(gpsData).length !== 0) {
        console.log(`keys: ${Object.keys(gpsData)}`)
        console.log(`keys length: ${Object.keys(gpsData).length}`)
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
        console.log(`No GPS metadata found for ${file}`)
        let fileName = file.slice(0, 5)
        console.log(`fileName: ${fileName}`)
        if (fileName in manualLatLon) {
          metadata.latitudeDecimal = manualLatLon[fileName].latitude
          metadata.longitudeDecimal = manualLatLon[fileName].longitude
        }
        console.log(`metadata: ${metadata}`)
      }
    } catch (err) {
      console.error('Error extracting metadata:', err)
    }

    const uploadTimeStampUTC = Date.now()
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
