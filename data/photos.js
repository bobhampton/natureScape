import { photos, locations } from '../config/mongoCollections.js'
import sharp from 'sharp'
import exifReader from 'exif-reader'
import { findKeys, latLonToDecimal } from '../routes/helpers.js'
import validation from './helpers.js'

export const findLocationId = async (area, state) => {
  const locationsCollection = await locations()
  const location = await locationsCollection.findOne({
    area,
    state
  })

  if (!location) {
    console.log(`Location ${area}, ${state} not found`)
    return null
  }

  return location._id
}

// Function to add location to database
export const addLocation = async (state, city, area) => {
  const newLocation = {
    state,
    city,
    area
  }

  const locationsCollection = await locations()
  const insertInfo = await locationsCollection.insertOne(newLocation)

  if (insertInfo.insertedCount === 0) {
    throw 'Could not add location'
  } else {
    console.log(
      `Location ${area}, ${state} added to the DB with id ${insertInfo.insertedId}`
    )
  }

  return insertInfo.insertedId
}

export const addImage = async (name, desc, imageFile) => {
  let metadata = {}

  // Create a new photo object
  let newPhoto = {
    photo_name: name,
    photo_description: desc,
    user_id: null,
    date_time_taken: null,
    date_time_uploaded: null,
    likes: 0,
    verification_rating: 0,
    location: {
      latitude: null,
      longitude: null,
      heading: null,
      location_id: null
    },
    img: {
      contentType: null,
      data: null
    }
  }

  // Extract metadata from the image using sharp
  const image = sharp(imageFile.data).withMetadata().toFormat('jpeg')
  metadata = await image.metadata()

  // Convert EXIF to display in Compass
  if (metadata.exif) {
    metadata.exif = exifReader(metadata.exif)
  }

  const searchKeys = [
    'GPSLatitude',
    'GPSLongitude',
    'GPSLatitudeRef',
    'GPSLongitudeRef',
    'GPSImgDirection',
    'DateTimeOriginal'
  ]
  /* 
    we might need these later?
    'GPSImgDirectionRef',
    'GPSAltitude',
    'GPSTimeStamp,
     */

  // See if we got dem keys we need
  const photoData = findKeys(metadata, searchKeys)

  // Convert GPS coordinates to decimal format
  if (Object.keys(photoData).length !== 0) {
    if (photoData.GPSImgDirection) {
      newPhoto.location.heading = photoData.GPSImgDirection
    }
    if (photoData.DateTimeOriginal) {
      newPhoto.date_time_taken = new Date(photoData.DateTimeOriginal)
    }
    if (
      photoData.GPSLatitude &&
      photoData.GPSLongitude &&
      photoData.GPSLatitudeRef &&
      photoData.GPSLongitudeRef
    ) {
      const lat = photoData.GPSLatitude
      const lon = photoData.GPSLongitude
      const latRef = photoData.GPSLatitudeRef
      const lonRef = photoData.GPSLongitudeRef
      const { latitude, longitude } = latLonToDecimal(lat, lon, latRef, lonRef)

      /*
        TODO:
        - Will need to implement a locationId lookup/creation 
          based on lat/lon once Vraj finishes how he wants to 
          define an area by lat/lon. For now, if photo has lat/lon
          they will be stored, but location_id will be null.
        */

      newPhoto.location.latitude = latitude
      newPhoto.location.longitude = longitude
    }
  }

  // Get the current time in UTC
  const temp = Date.now()
  const uploadTimeStampUTC = new Date(temp)

  // Set the new photo object properties
  ;(newPhoto.photo_name = name),
    (newPhoto.photo_description = desc),
    (newPhoto.date_time_uploaded = uploadTimeStampUTC),
    (newPhoto.img = {
      data: imageFile.data,
      contentType: imageFile.mimetype
    })
  newPhoto.metadata = metadata // All captured metadata - Keeping this for now

  const imageCollection = await photos()
  let insertInfo = await imageCollection.insertOne(newPhoto)

  if (insertInfo.insertedCount === 0) {
    throw 'Could not add image'
  } else {
    console.log(`Image ${name} saved to database`)
  }
}

export const getPhotosByUserId = async (userId) => {
  if(!userId) throw 'User Id is required!';
  userId = validation.checkId(userId);

  const photoCollection = await photos(); //Access photos collection
  const photoList = await photoCollection.find({userId: userId }).toArray(); //Find all photos by User Id
  if (!userId) throw 'No photos found with the given User ID'
  return photoList;
}
