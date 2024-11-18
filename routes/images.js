import { photos } from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb'
import express from 'express'
import { addImage } from '../data/photos.js'

const router = express.Router()

// Route to fetch all images
router.get('/', async (req, res) => {
  try {
    const imageCollection = await photos()
    const images = await imageCollection.find({}).toArray()
    const formattedImages = images.map(image => ({
      _id: image._id,
      photo_name: image.photo_name,
      photo_description: image.photo_description,
      img: {
        data: image.img.data.toString('base64'),
        contentType: image.img.contentType
      }
    }))
    res.render('images/index', { layout: 'main', images: formattedImages })
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
    res.render('images/image', {
      photo: {
        _id: photoData._id,
        photo_name: photoData.photo_name,
        photo_description: photoData.photo_description,
        user_id: photoData.user_id,
        date_time_taken: photoData.date_time_taken,
        date_time_uploaded: photoData.date_time_uploaded,
        likes: photoData.likes,
        verification_rating: photoData.verification_rating,
        location: photoData.location,
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
router.post('/upload', async (req, res) => {
  const maxUploadSize = 16 * 1024 * 1024 // 16MB

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }
  if (req.files.image.size > maxUploadSize) {
    return res.status(400).send(`Photo size must be less than ${maxUploadSize}`)
  }

  const { name, desc } = req.body
  const imageFile = req.files.image

  try {
    addImage(name, desc, imageFile)
    res.status(200).redirect('/images')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error uploading image')
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
