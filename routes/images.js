import { photos, locations, comments, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import express from 'express';
import {
  addImage,
  latLonAddLocation,
  getCommentsByPhotoId,
  getUsernameById,
  findLocationAreaByPhotoId,
} from '../data/photos.js';
import {checkXss} from '../middleware.js';

const router = express.Router();

// Middleware to check if user is logged in
const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Helper function to format image data
const formatImage = (image, loggedInUserId) => ({
  _id: image._id,
  photo_name: image.photo_name,
  photo_description: image.photo_description,
  user_id: image.user_id.toString(),
  likes: image.likes,
  views: image.views,
  img: {
    data: image.img.data.toString('base64'),
    contentType: image.img.contentType,
  },
  loggedInUserId,
});

// Fetch all images
router.get('/', checkAuth, async (req, res) => {
  const loggedInUserId = req.session.user._id
  const filter = req.query.filter

  try {
    const imageCollection = await photos();
    let images;

    if (filter === 'liked') {
      images = await imageCollection.find({}).sort({ likes: -1 }).limit(5).toArray();
    } else if (filter === 'views') {
      images = await imageCollection.find({}).sort({ views: -1 }).limit(5).toArray();
    } else {
      images = await imageCollection.find({}).toArray();
    }

    const formattedImages = images.map((image) => formatImage(image, loggedInUserId));

    res.render('images/index', {
      css: '/public/css/image_index.css',
      title: 'Gallery',
      images: formattedImages,
      loggedInUserId
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      css: '/public/css/error.css',
      title: 'Fetch Images Error',
      message: 'Error retrieving images.',
      error: err
    });
  }
});

// Display a specific photo
router.get('/photo/:id', checkAuth, async (req, res) => {
  const photoId = req.params.id;
  const loggedInUserId = req.session.user._id;

  try {
    const imageCollection = await photos();
    const photoData = await imageCollection.findOne({ _id: new ObjectId(photoId) });

    if (!photoData) {
      return res.status(404).send('Photo not found');
    }

    // Increment views
    await imageCollection.findOneAndUpdate(
      { _id: new ObjectId(photoId) },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

    const formattedComments = await getCommentsByPhotoId(photoId);
    const photoUsername = await getUsernameById(photoData.user_id);

    const isOwner = photoData.user_id.toString() === loggedInUserId.toString();

    res.render('images/image', {
      css: '/public/css/image.css',
      title: 'Photo',
      photo: {
        ...photoData,
        img: {
          contentType: photoData.img.contentType,
          data: photoData.img.data.toString('base64'),
        },
      },
      comments: formattedComments,
      photoUsername,
      isOwner,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      css: '/public/css/error.css',
      title: 'Display Photo Error',
      message: 'Error displaying photo.',
      error: err
    });
  }
});

// Upload an image
router
  .route('/upload')
  .get(checkAuth, (req, res) => {
    res.render('images/uploadImage', {
      css: '/public/css/image.css',
      title: 'Upload Image',
    });
  })
  .post(checkAuth, checkXss, async (req, res) => {
    const { name, desc } = req.body;
    const imageFile = req.files?.image;

    if (!imageFile || imageFile.size > 16 * 1024 * 1024) {
      return res.status(400).send('Invalid or oversized file.');
    }

    try {
      await addImage(name, desc, req.session.user._id, imageFile);
      
      res.redirect('/images');
    } catch (err) {
      console.error(err);
      res.status(400).render('error', {
        css: '/public/css/error.css',
        title: 'Add Image Error',
        message: 'Error uploading image.',
        error: err
      });
    }
  });

// Delete an image
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const imageCollection = await photos();
    const result = await imageCollection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).send('Image not found');
    }

    res.send('Image deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      css: '/public/css/error.css',
      title: 'Delete Image Error',
      message: 'Error deleting image.',
      error: err
    });
  }
});

// Like an image
router.post('/like/:id', checkAuth, async (req, res) => {
  console.log('req.params.id', req.params.id);
  try {
    const imageCollection = await photos();
    const imageId = new ObjectId(req.params.id);
    const image = await imageCollection.findOne({ _id: imageId });

    if (!image) {
      return res.status(404).send('Image not found');
    }

    const result = await imageCollection.findOneAndUpdate(
      { _id: imageId },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    );

    res.status(200).json({ likes: result.likes });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      css: '/public/css/error.css',
      title: 'Like Image Error',
      message:'Error liking image.',
      error: err
    });
  }
});

// Edit an image
router
  .route('/edit/:id')
  .get(checkAuth, async (req, res) => {
    try {
      const photoId = req.params.id;
      const imageCollection = await photos();
      const photoData = await imageCollection.findOne({ _id: new ObjectId(photoId) });

      if (!photoData) {
        return res.status(404).send('Photo not found');
      }

      const areaName = await findLocationAreaByPhotoId(photoId);

      res.render('images/edit', {
        css: '/public/css/image.css',
        title: 'Edit Image',
        photo: {
          ...photoData,
          img: {
            contentType: photoData.img.contentType,
            data: photoData.img.data.toString('base64'),
          },
        },
        areaName,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', {
        css: '/public/css/error.css',
        title: 'Edit Image Error',
        message:'Error editing image.',
        error: err
      });
    }
  })
  .post(checkAuth, checkXss, async (req, res) => {
    const photoId = req.params.id;
    const { photo_name, photo_description } = req.body;

    try {
      const imageCollection = await photos();
      const photoData = await imageCollection.findOne({ _id: new ObjectId(photoId) });

      if (!photoData) {
        return res.status(404).send('Photo not found');
      }

      if (photoData.user_id.toString() !== req.session.user._id.toString()) {
        return res.status(403).send('Unauthorized');
      }

      const updateData = { photo_name, photo_description };
      await imageCollection.updateOne(
        { _id: new ObjectId(photoId) },
        { $set: updateData }
      );

      res.redirect(`/images/photo/${photoId}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', {
        css: '/public/css/error.css',
        title: 'Update Image Error',
        message:'Error updating image.',
        error: err
      });
    }
  });

// Add a comment to an image
router.post('/comment/:id', checkAuth, checkXss, async (req, res) => {
  const photoId = req.params.id;
  const { comment_text } = req.body;

  if (!comment_text) {
    return res.status(400).render('error', {
      css: '/public/css/error.css',
      title: 'Comment Error',
      message:'You must supply input to comment on a photo.',
    });
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
      user_Id: req.session.user._id,
      comment_text,
      username: req.session.user.username,
      creation_time: new Date(),
    };

    await commentCollection.insertOne(newComment);

    res.json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      css: '/public/css/error.css',
      title: 'Add Comment Error',
      message:'Error adding comment.',
      error: err
    });
  }
});


export default router;
