import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const mapboxApiKey = process.env.MAPBOX_API_KEY;
import * as locationMethods from '../data/locations.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('locations/locationlist', {css:"/public/css/locationlist.css", token: mapboxApiKey, js:"/public/js/locationlist.js"});
})

router.get('/test', async (req, res) => {
    const photos = await locationMethods.getAllPhotos();
    res.json(photos);
}) 

export default router