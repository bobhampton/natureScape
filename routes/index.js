import homeRoutes from './home.js'
import imagesRoutes from './images.js'
import loginRoutes from './login.js'
import fileUpload from 'express-fileupload'
import locationRoutes from './locationlist.js'
import userRoutes from './users.js'
import express from 'express'
import termRoutes from './terms.js'

const constructorMethod = app => {
  // Middleware to handle file uploads and limit photo size to 16MB
  app.use(
    fileUpload({
      limits: { fileSize: 16 * 1024 * 1024 },
      abortOnLimit: true,
      responseOnLimit: 'Photo size must be less than 16MB'
    })
  )

  app.use(express.json());
  app.use(express.urlencoded({ extended: true}));

  // add routes here
  app.use('/', homeRoutes); // home
  app.use('/login', loginRoutes)// login
  app.use('/images', imagesRoutes); // GET all images
  app.use('/images/:id', imagesRoutes); // DELETE a specific image
  app.use('/images/upload', imagesRoutes); // POST upload an image
  app.use('/images/photo/:id', imagesRoutes); // GET a specific image
  app.use('/images/edit/:id', imagesRoutes); // Edit a specific image
  app.use('/locationlist', locationRoutes);
  app.use('/users', userRoutes);//Get all users -- Will not be in final product
  app.use('/users/:userId', userRoutes);//Get user by Id --Will not be in final product
  app.use('/users/newUser', userRoutes);//Register a new user
  app.use('/users/:userId/upload', userRoutes); //Upload photos through profile page
  app.use('/terms', termRoutes);
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route Not found' })
  });
}

export default constructorMethod
