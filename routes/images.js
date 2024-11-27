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
      likes: image.likes,
      img: {
        data: image.img.data.toString('base64'),
        contentType: image.img.contentType
      }
    }))

    res.render('images/index', {
      css: '/public/css/image_index.css',
      images: formattedImages
    })
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

    res.render('images/image', {
      css: '/public/css/image.css',
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
          data: photoData.img.data.toString('base64')
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

// Route to like an image
router.post('/like/:id', async (req, res) => {
  try {
    // Double check that image exists in DB
    const imageCollection = await photos()
    const imageId = new ObjectId(req.params.id)
    const image = await imageCollection.findOne({ _id: imageId })

    if (!image) {
      return res.status(404).send(`Image with id ${req.params.id} not found`)
    }

    // Increment the number of likes
    const result = await imageCollection.findOneAndUpdate(
      { _id: imageId },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    )

    // Make sure the number of likes were updated correctly
    if (image.likes === result.likes) {
      return res
        .status(500)
        .send(`Failed to update likes for imageId: ${req.params.id}`)
    }

    // Return the updated likes count
    //console.log(`Successfully updated likes for imageId: ${req.params.id}`); // Debugging
    res.status(200).json({ likes: result.likes })
  } catch (err) {
    console.log(err)
    res.status(500).send('Error liking image')
  }
})

export default router
