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
    cookie: { maxAge: 60000000 }
  })
);

// Middleware to attach session data to res.locals
app.use((req, res, next) => {
  res.locals.session = req.session; // Attach session data to res.locals
  res.locals.user = req.session.user; // Attach user data to res.locals
  next();
});

app.use((req, res, next) => {
  res.locals.session = req.session; // Attach session data to res.locals
  next();
});

app.use('/images', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
});

app.use('/images/:id', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
});

app.use('/images/upload', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
});

app.use('/images/photo/:id', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
});

app.use('/images/edit/:id', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
});

app.use('/locationlist', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
});

app.use('/profile/:userId', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
});

app.use('/profile/profile/:profileId', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
});

app.use('/login', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/profile/:userId')
  }
  next()
});

// Set up default layout and view engine for handlebars
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main',
  // Define custom helpers for handlebars
  helpers: {
    printObj: function(obj) {
      return JSON.stringify(obj, null, 2)
    },
    checkNull: function(value) {
      return value === null ? 'null' : value;
    },
    eq: function (v1, v2){
      return v1 == v2;
    }
  }
 }
))

app.set('view engine', 'handlebars')

// Set up routes
configRoutes(app)

// Protect against overflow attacks
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).render('error', {
      title: 'Error',
      js: '/public/js/image_edit.js',
      css: '/public/css/error.css',
      error: 'Request entity too large. Please reduce the size of your input.'
    });
  }
  next(err);
});

app.listen(port, async () => {
  console.log("We've now got a server!")
  console.log('Your routes will be running on http://localhost:3000')
})
