import { locations } from '../config/mongoCollections.js'


// Function to find location id by area and state
export const findLocationId = async (area, state) => {
    const locationsCollection = await locations()
    const location = await locationsCollection.findOne({
      area,
      state
    })
  
    if (!location) {
      //console.log(`Location ${area}, ${state} not found`) //debugging
      return null
    }
  
    return location._id
  } //End of findLocationId
  
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
      //console.log( `Location ${area}, ${state} added to the DB with id ${insertInfo.insertedId}`) //debugging
    }
  
    return insertInfo.insertedId
  } //End of addLocation