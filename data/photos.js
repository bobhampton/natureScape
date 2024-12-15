import {
  photos,
  locations,
  users,
  comments
} from '../config/mongoCollections.js'
import sharp from 'sharp'
import exifReader from 'exif-reader'
import validation from './helpers.js'
import { ObjectId } from 'mongodb'
import { convert } from 'geo-coordinates-parser'
import reverse from 'reverse-geocode'
import { lookUpRaw, lookUp, lookUpGeoJSON } from 'geojson-places'

export const findLocationAreaByPhotoId = async photoId => {
  const photoCollection = await photos()
  const photo = await photoCollection.findOne({
    _id: new ObjectId(photoId)
  })

  if (!photo) {
    return false
  }

  const locationId = photo.location.location_id
  const locationsCollection = await locations()
  const location = await locationsCollection.findOne({
    _id: new ObjectId(locationId)
  })

  return location.area
}

// Function to add location to database
export const latLonAddLocation = async (lat, lon, areaName) => {

  let newLocation = {
    country: null,
    state: null,
    city: null,
    area: areaName
  }

  let geoLookUp = lookUp(lat, lon)
  let stateCode = geoLookUp.state_code
  let splitStateCode = stateCode.split('-')
  let country = splitStateCode[0]
  let state = splitStateCode[1]

  newLocation.country = country
  newLocation.state = state

  // Check country to see if we can use reverse-geocode
  if (country === 'US' || country === 'CA' || country === 'AU') {
    let reverseGeo = reverse.lookup(lat, lon, country)
    
    if (reverseGeo) {
      // newLocation.state = reverseGeo.state_abbr
      newLocation.city = reverseGeo.city
      //newLocation.area = reverseGeo.city
    }
  }

  // Add newLocation to the database
  const locationCollection = await locations()
  const insertInfo = await locationCollection.insertOne(newLocation)

  if (insertInfo.insertedCount === 0) {
    throw 'Could not add location'
  }

  return insertInfo.insertedId
}

export const findLocationByAreaName = async areaName => {
  const locationCollection = await locations()
  const location = await locationCollection.findOne({ area: areaName })

  if (!location) {
    return null
  }

  return location._id
}

export const addImage = async (name, desc, user_id, imageFile) => {
  // Create a new photo object
  user_id = new ObjectId(user_id)
  
  let newPhoto = {
    photo_name: name,
    photo_description: desc,
    user_id,
    date_time_taken: null,
    date_time_uploaded: null,
    likes: 0,
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

  // Set the newPhoto properties that we can

  // Extract metadata from the image using sharp
  let metadata = {}
  const image = sharp(imageFile.data).withMetadata().toFormat('jpeg')
  metadata = await image.metadata()

  // Set the newPhoto properties that we can
  newPhoto.photo_name = name
  newPhoto.photo_description = desc
  newPhoto.img = {
    data: imageFile.data,
    contentType: imageFile.mimetype
  }
  newPhoto.metadata = metadata

  let areaName = null

  // Convert EXIF to display in Compass
  if (metadata.exif) {
    metadata.exif = exifReader(metadata.exif)

    areaName = metadata.exif.Image.ImageDescription

    // Convert GPS coordinates to decimal format
    let latRef = metadata.exif.GPSInfo.GPSLatitudeRef
    let lonRef = metadata.exif.GPSInfo.GPSLongitudeRef
    let lat = metadata.exif.GPSInfo.GPSLatitude
    let lon = metadata.exif.GPSInfo.GPSLongitude

    // Round seconds to 2 decimal places
    lat[2] = Math.round((lat[2] + Number.EPSILON) * 100) / 100
    lon[2] = Math.round((lon[2] + Number.EPSILON) * 100) / 100

    let latLonToDecimal = convert(
      `${lat[0]}°${lat[1]}'${lat[2]}"${latRef}, ${lon[0]}°${lon[1]}'${lon[2]}"${lonRef}`
    )

    // Set the newPhoto EXIF properties
    newPhoto.date_time_taken = metadata.exif.Photo.DateTimeDigitized
    newPhoto.location.latitude = latLonToDecimal.decimalLatitude
    newPhoto.location.longitude = latLonToDecimal.decimalLongitude
  }

  // See if the location already exists in the database
  let locationId = await findLocationByAreaName(areaName)

  // Add the location to the database if it doesn't exist
  if (locationId === null) {
    locationId = await latLonAddLocation(newPhoto.location.latitude, newPhoto.location.longitude, areaName)
    newPhoto.location.location_id = locationId
  } else {
    newPhoto.location.location_id = locationId
  }

  // Set the newPhoto upload time
  const temp = Date.now()
  const uploadTimeStampUTC = new Date(temp)
  newPhoto.date_time_uploaded = uploadTimeStampUTC

  // Add the new photo to the database
  const imageCollection = await photos()
  let insertInfo = await imageCollection.insertOne(newPhoto)

  if (insertInfo.insertedCount === 0) {
    throw 'Could not add image'
  } else {
    console.log(`Image ${name} saved to database`)
  }
}

export const getPhotosByUserId = async userId => {
  if (!userId) throw 'User Id is required!'
  userId = validation.checkId(userId)

  const photoCollection = await photos() //Access photos collection
  const photoList = await photoCollection.find({ userId: userId }).toArray() //Find all photos by User Id
  if (!userId) throw 'No photos found with the given User ID'
  return photoList
}

export const getCommentsByPhotoId = async photoId => {
  if (!photoId) throw 'Photo Id is required!'

  // Find all comments associated with the photo
  const commentCollection = await comments()
  const commentsData = await commentCollection
    .find({ photo_Id: new ObjectId(photoId) })
    .toArray()

  const formattedComments = commentsData.map(comment => ({
    _id: comment._id,
    photo_Id: comment.photo_Id,
    user_Id: comment.user_Id,
    comment_text: comment.comment_text,
    creation_time: comment.creation_time
  }))

  if (!formattedComments) {
    return false
  }

  for (const comment of formattedComments) {
    comment.username = await getUsernameById(comment.user_Id)
  }
  return formattedComments
}

export const getUsernameById = async userId => {
  if (!userId) throw '2User Id is required!'

  const userCollection = await users()
  const user = await userCollection.findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return null
  } else {
    return user.username
  }
}
