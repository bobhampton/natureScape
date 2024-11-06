import express from 'express';
import exphbs from 'express-handlebars';
import configRoutes from './routes/index.js'
import fileUpload from 'express-fileupload';

const app = express();
const port = 3000;

// Set up express
app.use('/public', express.static('public')); // Serve static files from 'public' dir
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(express.json()); // Parse JSON requests (lets you use 'req.body')

// Set up default layout and view engine for handlebars
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' })); 
app.set('view engine', 'handlebars');

// Set up routes
configRoutes(app)

app.use(fileUpload({
  limits: { fileSize: 16 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: "Photo size must be less than 16MB"
}));

app.listen(port, async () => {
  console.log("We've now got a server!")
  console.log('Your routes will be running on http://localhost:3000')
})