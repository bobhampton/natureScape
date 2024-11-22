// This data file should export all functions using the ES6 standard as shown in the lecture code
//NO GAME COLLECTION: GAMES as subdocument to users
import userData from "./users.js"; //No {} for export default
import {users} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import validation from './helpers.js';
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { photos } from '../config/mongoCollections.js'
//import {v4} from 'uuid';//Generates ids

const exportedMethods = {

  async createProfile (
    userId,
    bio,
    //profile_picture
  ) {
    
    
    //1. Input validation
    userId = validation.checkId(userId, "user id");
    bio = bio.validation.checkString;

     //2. Get the user from the database by their id
     let user = await users.getUserById(userId);
     
     //3. Performing an update on the team object in the database
         //Create a game object in JS that fully represents the updated team 
         const profile = {
         _id: new ObjectId(), 
         bio: bio//generates a uuid 
         //profile picture. 
       };
     user.profile.push(profile);
 
     const usersCollection = await users(); //awaiting the users collection
     const updatedInfo = await usersCollection.findOneAndUpdate(
         //{_id: new ObjectId user.id)},
         {_id: new ObjectId(userId)},
         {$set: user},// user holds the profile
         {returnDocument: 'after'}
     );//Database is now updated
     if(!updatedInfo){
       throw "Could not update the user successfully"
     };
     updatedInfo._id = updatedInfo._id.toString();
     return await userData.getUserById(updatedInfo._id); //if it returns team 1 we were able to ask te same team with updated values
         //Generate an objectId for a new game and apply the fields 
     //4. Affect the win-loss count for team.
       
     //5. Return the team object pointed to by teamId with updated game


  //   const filePath = path.join(imageFolder, file)
  //   const fileExtension = path.extname(file).toLowerCase()
  //   if (!['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(fileExtension)) {
  //       throw "The file extension type is invalid to pull from database"
  //   }
  //   // const fileData = fs.readFileSync(filePath)
  //   // const contentType = 'image/' + fileExtension.slice(1)
  //   // const photoId = req.params.id
  // try {
  //   const imageCollection = await photos()
  //   const photoData = await imageCollection.findOne({
  //     _id: new ObjectId(photoId)
  //   })
  //   if (!photoData) {
  //     return res.status(404).send('Photo not found')
  //   }
  //   const base64Image = photoData.img.data.toString('base64')
  //   res.render('images/image', {
  //     photo: {
  //       _id: photoData._id,
  //       name: photoData.name,
  //       desc: photoData.desc,
  //       img: {
  //         contentType: photoData.img.contentType,
  //         data: base64Image
  //       },
  //       metadata: photoData.metadata
  //     }
  //   })
  // } catch (err) {
  //   console.error(err)
  //   res.status(500).send('Server error')
  // }

    //pull from {photos} from../config/mongoCollections.js
    //profile_picture = await photosData.getPhotoById(photoId)
    // if(!profile_picture || !validImageTypes.includes(profile_picture.mimetype)){
    //     throw "Invalid profile picture.  Please upload a valid image file."
    // }

   
  },

  async getProfile (profileId) {
    //1. Validationuser = validation.checkuser, "Game ID");
    //2 No object to update
    //3. Establish connection with users database
    profileId = validation.checkId(profileId, "User Id")
    const userCollection = await users();
    const foundProfile = await userCollection.findOne(
      {'profile._id': new ObjectId(profileId)},
      {projection: {_id:0, 'profile.$':1}}
    );
    //Check to make sure game was found
    if(foundProfile === null){
      throw "Profile not found";
    }
    if(!foundProfile|| foundProfile.profile.length === 0){
      throw "The user profile is not found";
    };
    //console.log(foundGame.games);
    //Returns one element only, and not an array. [0] returns element
    return foundProfile.profile[0];
  },

  async updateProfile (profileId, updateObject) {
    profileId = validation.checkId(profileId, " Profile Id");
    //Create an object to hold updates
    const updateObjectData = {};
    
    if(updateObject.profileId){
      updateObjectData['profile.Id'] = validation.checkId(
      updateObject.profileId,"Profile Id");
      }
     const userCollection = await users(); 
    let userWithProfile = await userCollection.findOne(
    //   //In '' because it is a subdocument
    //   //Search all mongodb profiles for passed in Id
    {'profile._id': new ObjectId(profileId)});
    
    if(!userWithProfile){
      throw "Profile for post not found";
      };

    const foundProfile = userWithProfile.profile.find(profile => profile._id.equals(
      new Object(profileId)));
    
    const myString = validation.buildUpdateString(updateObjectData);

    let updatedProfile = await userCollection.findOneAndUpdate(
      {'_id': userWithProfile._id, 'profile._id': new ObjectId(profileId)},
      myString,
      {returnDocument: 'after'}
      //Now we have an updated profile
    );

    if(!updatedProfile){
      throw `Could not update the post with id ${id}`;
    };

    return updatedProfile;
  },

    async removeProfile (profileId) {
    if(profileId === undefined) throw 'No profile id provided';
    profileId = validation.checkId(profileId);
    const userCollection = await users();

    //Find the team with the game of specific profile Id
    //The profile is in the database
    let userWithProfile = await userCollection.findOne(
      //In '' because it is a subdocument
      //Search all mongodb games for passed in Id
      {'profile._id': new ObjectId(profileId)});

      if(!userWithProfile){
        throw "No profile found with that specified Id"
      }

    //Retrieve the game object to remove
    const profileToRemove = userWithProfile.profile.find(profile => profile._id.toString() =user);
    if(!profileToRemove){
      throw "Profile not be retrieved from database";
    }

      //Store the parent teamId in a variable
      let userId = userWithProfile._id;

      //Remove the game with the specifiuser from the games array
      const updateResult = await userCollection.updateOne(
        {_id: userId},
        {$pull: {profile: {_id: new ObjectId(profileId)}}}
      );

      if(updateResult.modifiedCount === 0){
        throw "Failed to remove the profile"
      }

    //Return the updated team document with the game removed
    const updatedUser = await userCollection.findOne({_id: userId});
    return updatedUser;
  }
};
export default exportedMethods;