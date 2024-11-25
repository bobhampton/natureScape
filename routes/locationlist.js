import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const mapboxApiKey = process.env.MAPBOX_API_KEY;

const router = express.Router();

router.get('/', (req, res) => {
    res.render('locations/locationlist', {css:"/public/css/locationlist.css", token: mapboxApiKey, js:"/public/js/locationlist.js"});
})

export default router