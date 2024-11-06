// import routes here
import imagesRoutes from './images.js'

const constructorMethod = app => {

  // This might be our landing page, but is used for testing purposes
  app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' })
  })

  // add routes here
  app.use('/images', imagesRoutes) // GET all images
  app.use('/images/:id', imagesRoutes) // DELETE a specific image
  app.use('/images/upload', imagesRoutes) // POST upload an image
  app.use('/images/photo/:id', imagesRoutes) // GET a specific image

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route Not found' })
  })
}

export default constructorMethod
