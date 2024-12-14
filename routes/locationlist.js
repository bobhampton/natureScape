import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const mapboxApiKey = process.env.MAPBOX_API_KEY;
import * as locationMethods from '../data/locations.js';
import { photos, locations } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const locations = await locationMethods.getAllPhotos();
    res.render('locations/locationlist', {css:"/public/css/locationlist.css", token: mapboxApiKey, js:"/public/js/locationlist.js", locations: JSON.stringify(locations)});
  } catch (error) {
    console.log(error);
    res.status(500).render('error', {
      css: '/public/css/error.css',
      title: 'Retrieving Location Information Error',
      message: 'Unable to retrieve location information from Database.',
      error: error
    });
  }
})

router.get('/:locationId', async (req, res) => {
  try {
    //Get location using locationId(req, res) => {
    const locationCollection = await locations();
    const locationFound = await locationCollection.findOne({
      _id: new ObjectId(req.params.locationId)
    });

    const location = {
      _id: locationFound._id,
      state: locationFound.state,
      city: locationFound.city,
      location_name: locationFound.area
    };
    
    let formattedPhotos;
    const photoCollection = await photos()
    const userPhotos = await photoCollection.find(
      { 'location.location_id': new ObjectId(req.params.locationId) }).toArray();
    formattedPhotos = userPhotos.map(photo => ({
      _id: photo._id,
      photo_name: photo.photo_name,
      photo_description: photo.photo_description,
      photo_date_time: photo.date_time_taken ?? photo.date_time_uploaded,
      likes: photo.likes,
      views: photo.views,
      img: {
        data: photo.img.data.toString('base64'),
        contentType: photo.img.contentType
      }
    })).sort((a, b) => b.photo_date_time - a.photo_date_time);

    //Render page using location data and photos
    res.render('locations/location_view_edit', {
      locationName: location.location_name, 
      city: location.city, 
      state: location.state, 
      images: formattedPhotos, 
      css: '/public/css/location_view_edit.css', 
      js: '/public/js/location_view_edit.js'
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Error retrieving images')
  }

})
//.post()

export default router