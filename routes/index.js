/*
import routes here
ex:
import fooRoutes from './foo.js'
import barRoutes from './bar.js'
*/

const constructorMethod = app => {

  // This might be our landing page, but is used for testing purposes
  app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' })
  })

  /*
  add routes here
  ex:
  app.use('/foo', fooRoutes)
  app.use('/foo/:fooId', fooRoutes)
  app.use('/bar', barRoutes)
  app.use('/bar/:barId', barRoutes)

  */

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route Not found' })
  })
}

export default constructorMethod
