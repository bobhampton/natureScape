import express from 'express'
import session from 'express-session'
import exphbs from 'express-handlebars'
import configRoutes from './routes/index.js'

const app = express()
const port = 3000

// Set up express
app.use('/public', express.static('public')) // Serve static files from 'public' dir
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded requests
app.use(express.json()) // Parse JSON requests (lets you use 'req.body')

app.use(
  session({
    secret: 'mySecretKey to sign cookie',
    resave: false,
    saveUninitialized: false,
    //cookie: { maxAge: 600000 }
  })
);

// Set up default layout and view engine for handlebars
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main',
  // Define custom helpers for handlebars
  helpers: {
    printObj: function(obj) {
      return JSON.stringify(obj, null, 2)
    },
    checkNull: function(value) {
      return value === null ? 'null' : value;
    }
  }
 }
))

app.set('view engine', 'handlebars')

// Set up routes
configRoutes(app)

app.listen(port, async () => {
  console.log("We've now got a server!")
  console.log('Your routes will be running on http://localhost:3000')
})
