

import { photos, locations, comments, users } from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb'
import express from 'express'
import { 
  addImage, 
  latLonAddLocation,
  getCommentsByPhotoId, 
  getUsernameById,
  findLocationAreaByPhotoId 
} from '../data/photos.js'

const router = express.Router()

// Route to fetch all images
router.get('/', async (req, res) => {

  // let user = req.session.user;
  // if (!user) {
  //   return res.redirect('/login');
  // }
  try {
    //Use query parameter
    const filter = req.query.filter;
    const imageCollection = await photos()
    let images;
    if(filter === "liked"){
      images = await imageCollection.find({}).sort({likes: -1}).limit(5).toArray();
    }else if(filter === 'views'){
      images = await imageCollection.find({}).sort({views: -1}).limit(5).toArray();
    }else{
      images = await imageCollection.find({}).toArray();
    }
    const formattedImages = images.map(image => ({
      _id: image._id,
      photo_name: image.photo_name,
      photo_description: image.photo_description,
      likes: image.likes,
      views: image.views,
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
  let user = req.session.user

  console.log('user._id:', user._id)

  if (!user) {
    return res.redirect('/login')
  }

  try {
    const imageCollection = await photos()
    const photoData = await imageCollection.findOne({
      _id: new ObjectId(photoId)
    })

    if (!photoData) {
      return res.status(404).send('Photo not found')
    }

    // Increment the number of views
    const result = await imageCollection.findOneAndUpdate(
      { _id: new ObjectId(photoId) },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    )
  
    // Get all comments associated with the photo
    let formattedComments = await getCommentsByPhotoId(photoId)

    let photoUsername = await getUsernameById(photoData.user_id)

   //let userCollection = await users()

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
        views: photoData.views,
        verification_rating: photoData.verification_rating,
        location: photoData.location,
        img: {
          contentType: photoData.img.contentType,
          data: photoData.img.data.toString('base64')
        }
      },
      comments: formattedComments,
      photoUsername
      //loggedInUserId,
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

  const { name, desc, areaName } = req.body
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

// Route to edit an image by ID
router.get('/edit/:id', async (req, res) => {
  const photoId = req.params.id;

  try {
    const imageCollection = await photos();
    const photoData = await imageCollection.findOne({ _id: new ObjectId(photoId) });

    if (!photoData) {
      return res.status(404).send('Photo not found');
    }

    // Get the area name (if it exists)
    let areaName = null;

    areaName = await findLocationAreaByPhotoId(photoId);

    res.render('images/edit', {
      css: '/public/css/image.css',
      photo: {
        _id: photoData._id,
        photo_name: photoData.photo_name,
        photo_description: photoData.photo_description,
        location: {
          latitude: photoData.location.latitude,
          longitude: photoData.location.longitude,
          heading: photoData.location.heading,
          location_id: photoData.location.location_id
        },
        img: {
          contentType: photoData.img.contentType,
          data: photoData.img.data.toString('base64')
        }
      },
      areaName,
      js: '/public/js/image.js'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to handle the form submission and update the photo information
router.post('/edit/:id', async (req, res) => {
  const photoId = req.params.id;
  const { photo_name, photo_description } = req.body;

  try {
    const imageCollection = await photos();
    const photoData = await imageCollection.findOne({ _id: new ObjectId(photoId) });
    const updateData = {
      photo_name,
      photo_description,
    };

    // Set/add the area name
    // let newLocation = null;

    // if (!findLocationAreaByPhotoId(photoId)) {
    //   newLocation = await latLonAddLocation(
    //     photoData.location.latitude, 
    //     photoData.location.longitude, 
    //     areaName
    //   );
    // }



    const result = await imageCollection.updateOne(
      { _id: new ObjectId(photoId) },
      { $set: updateData }
    );

    res.redirect(`/images/photo/${photoId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to handle comment submission
router.post('/comment/:id', async (req, res) => {
  const photoId = req.params.id;
  const { comment_text } = req.body;
  console.log('photoId:', photoId);

  if (!comment_text) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const photoCollection = await photos();
    const photo = await photoCollection.findOne({ _id: new ObjectId(photoId) });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const commentCollection = await comments();
    const newComment = {
      photo_Id: photo._id,
      user_Id: null, // Replace with the actual user ID if available
      comment_text: comment_text,
      creation_time: new Date()
    };

    const insertResult = await commentCollection.insertOne(newComment);

    if (insertResult.insertedCount === 0) {
      throw new Error('Failed to add comment');
    }

    res.status(200).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router
