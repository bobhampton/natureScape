import express from 'express'
import exphbs from 'express-handlebars'
import configRoutes from './routes/index.js'

const app = express()
const port = 3000

// Set up express
app.use('/public', express.static('public')) // Serve static files from 'public' dir
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded requests
app.use(express.json()) // Parse JSON requests (lets you use 'req.body')

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

app.use('/private', (req, res, next) => {
    if (!req.session.user) {
        //If no user logged in, redirect to login page
        return res.redirect('/');
    } else {
        next();
    }
})

app.use('/login', (req, res, next) => {
    if (req.session.user) {
        //If no user logged in, redirect to login page
        return res.redirect('/private');
    } else {
        req.method = 'POST';
        next();
    }
})

// Set up routes
configRoutes(app)

app.listen(port, async () => {
  console.log("We've now got a server!")
  console.log('Your routes will be running on http://localhost:3000')
})
