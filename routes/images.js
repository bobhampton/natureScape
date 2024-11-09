import { photos } from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb'
import express from 'express'
import exifReader from 'exif-reader'
import sharp from 'sharp'
import { findKeys, latLonToDecimal } from './helpers.js'

const router = express.Router()

// Route to fetch all images
router.get('/', async (req, res) => {
  try {
    const imageCollection = await photos()
    const images = await imageCollection.find({}).toArray()
    const formattedImages = images.map(image => ({
      _id: image._id,
      name: image.name,
      desc: image.desc,
      img: {
        data: image.img.data.toString('base64'),
        contentType: image.img.contentType
      }
    }))
    //res.json(formattedImages);
    res.render('images/index', { images: formattedImages })
  } catch (err) {
    console.log(err)
    res.status(500).send('Error retrieving images')
  }
})

// Route to display a specific photo
router.get('/photo/:id', async (req, res) => {
  const photoId = req.params.id
  try {
    const imageCollection = await photos()
    const photoData = await imageCollection.findOne({
      _id: new ObjectId(photoId)
    })
    if (!photoData) {
      return res.status(404).send('Photo not found')
    }
    const base64Image = photoData.img.data.toString('base64')
    /* res.render('images/image', {
      photo: {
        ...photoData,
        img: {
          contentType: photoData.img.contentType,
          data: base64Image
        }
      }
    }) */
    res.render('images/image', {
      photo: {
        _id: photoData._id,
        name: photoData.name,
        desc: photoData.desc,
        img: {
          contentType: photoData.img.contentType,
          data: base64Image
        },
        metadata: photoData.metadata
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})

// Route to upload an image
//router.post('/upload', async (req, res) => {
router.post('/upload', async (req, res) => {
  const maxUploadSize = 16 * 1024 * 1024 // 16MB

  // console.log('req.files:', req.files); // Debugging line

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }
  if (req.files.image.size > maxUploadSize) {
    return res.status(400).send(`Photo size must be less than ${maxUploadSize}`)
  }

  const { name, desc } = req.body
  const imageFile = req.files.image

  let metadata = {}
  try {
    // Extract metadata from the image using sharp
    const image = sharp(imageFile.data).withMetadata().toFormat('jpeg')
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

      const { latitude, longitude } = latLonToDecimal(lat, lon, latRef, lonRef)
      metadata.latitudeDecimal = latitude
      metadata.longitudeDecimal = longitude
    }
  } catch (err) {
    console.error('Error extracting metadata:', err)
  }

  /* 
        TODO: 
        -Add check for lat/lon metadata and prompt user to enter manually if not found
        -Add a photo download option (res.download(file.ext))

    */
  const timeStampUTC = Date.now()
  // Create a new image document
  const newImage = {
    name: name,
    desc: desc,
    timeStampUTC,
    img: {
      //data: modifiedImageBuffer,
      data: imageFile.data,
      contentType: imageFile.mimetype
    },
    metadata: metadata
  }
  try {
    const imageCollection = await photos()
    await imageCollection.insertOne(newImage)
    console.log('Image uploaded successfully!')
    res.redirect('/images')
  } catch (err) {
    console.error('Error saving image:', err)
    res.status(500).send('Server error')
  }
})

// Route to delete an image by ID
router.delete('/:id', async (req, res) => {
  try {
    const imageCollection = await photos()
    const result = await imageCollection.deleteOne({
      _id: new ObjectId(req.params.id)
    })
    if (result.deletedCount === 0) {
      return res.status(404).send('Image not found')
    }
    res.status(200).send('Image deleted successfully')
  } catch (err) {
    console.log(err)
    res.status(500).send('Error deleting image')
  }
})

export default router
