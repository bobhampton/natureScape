
import {Router} from 'express'; //{What is inside is something specific being imported}
const router = Router();
import userData from '../data/users.js'
import profileData from '../data/profile.js';
import validation from '../helpers.js';

router
  .route('/:userId')//get me all profiles for a team id
  //localhost:3000/profile/507f1f77bcf86cd799439011
  .get(async (req, res) => {
     //code here for GET  get allgames for the team
     const Goo = req.params.userId;
     try{
       validation.checkId(Goo, "User ID");//gets teamID from line 9
     }catch(e){
       return res.status(400).json({error: e});
     }

  //If userId is not found
  try{
    const user = await userData.getUserById(Goo); 
    if(!user || typeof user.profile !== 'object' || user.profile === null){   
      return res.status(404).json({error: "No profile found for the Id"})
    }
    //All 'profiles' for the user
    const profileList = user.profile;
    return res.status(200).json({profileList});
  }catch(e){
    return res.status(404).json({error: "User not found"})
  }
  
  // try{
  //   const gameList = await gameData.getAllGames(teamId);
  //     return res.status(200).json({gameList})
  //   }catch(e){
  //     return res.status(404).json({error:e});
  //   }

  })
  .post(async (req, res) => {
    //Post a game to the games array for a team
    //code here for POST
    const profileInfo = req.body;
  try{
    validation.profileCheckInputs(profileInfo.userId, profileInfo.bio);
    
    validation.checkId(userId);
    
  }catch(e){
    return res.status(400).json({error: e});
  }

  try{
    const newProfile = await profileData.createProfile(profileInfo.userId, profileInfo.bio);

      res.status(200).json(newProfile);
  }catch(e){
      res.sendStatus(404).json({error: e})
  }
  });

router
  .route('/profile/:profileId')
  .get(async (req, res) => {
    //code here for GET
    
    try{
      req.params.profileId = validation.checkId(req.params.profileId, "Profile id");
      //validation.checkId(gameId);
    }catch(e){
      res.status(400).json({error: e});
    }
    //Global profileId
    const profileId = req.params.profileId;
    try{
      const profile = await profileData.getGame(profileId);
      //if(!gameList || gameList.length === 0){
      if(!profile){
        throw "Profile Id is not found"
      }else{
        return res.status(200).json(profile);
      }}catch(e){
        return res.status(404).json({error:e});
      }
  })
  .patch(async (req, res) => {
    //code for PATCH

    const requestBody = req.body;//Will be what will delete
    if(!requestBody || Object.keys(requestBody).length === 0){
      return res.status(400).json({error: "There are no fields in the request body"})
    };

    //Check the inputs that will return 400 if it fails
    try{
      req.params.profileId = validation.checkId(req.params.profileId, "Profile Id");
      if(requestBody.bio){
        requestBody.bio = validation.checkString(requestBody.bio, "bio");
      }
      }catch(e){
      return res.status(400).json({error: e});
    }

    //See if game exists
    try{
    const getProfileData =  await profileData.getProfile(req.params.profileId);
    res.status(200).json({getProfileData});
    }catch(e){
      res.status(404).json({error: "Profile not found"})
    }
    
    try{
      
      const updatedProfile = await profileData.updateProfile(req.params.profileId, requestBody);
      
      res.status(200).json({updatedProfile});

    }catch(e){
      
      return res.status(404).json({error:e});
    }
    
  }) 
    
  .delete(async (req, res) => {
    //code here for DELETE
    //localhost:3000/games/game/607f1f77bcf67cd649439021
    //req.params pulls params in request body
    //gameId = validation.checkId(gameId);
    
    try{
      req.params.profileId = validation.checkId(req.params.profileId, "Profile Id");
      validation.checkId(req.params.profileId);
    }catch(e){
      res.status(400).json({error: e});
    }
    //let gameId = req.params.gameId  //Global scoped gameID
    try{
      profileData.getProfile(req.params.profileId);
    }catch(e){
      res.status(404).json({error: "Profile not found"})
    }

    try{
      const deletedProfile = await profileData.removeProfile(req.params.profileId);
      res.status(200).json({deletedProfile});
    }catch(e){
      return res.status(404).json({error:e});
    }

  });
  export default router;