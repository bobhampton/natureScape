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
    } catch (err) {
      console.error('Error extracting metadata:', err)
    }

    const timeStampUTC = Date.now()
    const newImage = {
      name: path.basename(file, fileExtension),
      desc: 'Seed image',
      timeStampUTC,
      img: {
        data: Buffer.from(fileData),
        contentType: contentType
      },
      metadata: metadata // Store the extracted metadata
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
