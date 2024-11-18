// This data file should export all functions using the ES6 standard as shown in the lecture code
//NO GAME COLLECTION: GAMES as subdocument to teams
import userData from "./users.js"; //No {} for export default
import {users} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import validation from '../helpers.js';
//import {v4} from 'uuid';//Generates ids

const exportedMethods = {

  async createProfile (
    bio,
    profile_picture
  ) {

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp;'];
    //1. Input validation
    bio = bio.validation.checkString;

    //pull from {photos} from../config/mongoCollections.js
    //profile_picture = await photosData.getPhotoById(photoId)
    if(!profile_picture || !validImageTypes.includes(profile_picture.mimetype)){
        throw "Invalid profile picture.  Please upload a valid image file."
    }

    //2. Get the team for teamId and opposingTeamId
    let team1 = await teamData.getTeamById(checkedGameInputs.teamId);
    let team2 = await teamData.getTeamById(checkedGameInputs.opposingTeamId);
    if(!team1 || !team1.sport || !team2 || !team2.sport){
      throw "Both team1 and team2 must have a sport defined"
    }
    if(team1.sport.toLowerCase() !== team2.sport.toLowerCase()){
      throw "The two teams must be in the same sport"
    }
    //3. Performing an update on the team object in the database
        //Create a game object in JS that fully represents the updated team 
        const profile = {
        _id: new ObjectId(), //generates a uuid 
        //profile picture. 
      };
    team1.games.push(game);

    //Update team.win/loss
    if(win){
      team1.winLossCount = validation.addWin(team1.winLossCount);
    }else{
      team1.winLossCount = validation.addLoss(team1.winLossCount);
    };

    const teamCollection = await teams(); //awaiting the teams collection
    const updatedInfo = await teamCollection.findOneAndUpdate(
        //{_id: new ObjectId(team1.id)},
        {_id: new ObjectId(teamId)},
        {$set: team1},//team1 holds the game
        {returnDocument: 'after'}
    );//Datebase is now updated
    if(!updatedInfo){
      throw "Could not update the game successfully"
    };
    updatedInfo._id = updatedInfo._id.toString();
    return await teamData.getTeamById(updatedInfo._id); //if it returns team 1 we were able to ask te same team with updated values
        //Generate an objectId for a new game and apply the fields 
    //4. Affect the win-loss count for team.
      
    //5. Return the team object pointed to by teamId with updated game
  },

  async getAllGames (teamId) {
    try{
    validation.checkId(teamId);
    }catch(e){
      console.error("validation Error:", e)
      throw "Invalid team Id provided";
    }

    let theTeam = await teamData.getTeamById(teamId);
    if(!theTeam || !Array.isArray(theTeam.games)){
      throw "No games for the team ID"
    }
  
    return theTeam.games;
  },

  async getGame (gameId) {
    //1. Validation
    gameId = validation.checkId(gameId, "Game ID");
    //2 No object to update
    //3. Establish connection with teams database
    const teamCollection = await teams();
    const foundGame = await teamCollection.findOne(
      {'games._id': new ObjectId(gameId)},
      {projection: {_id:0, 'games.$':1}}
    );
    //Check to make sure game was found
    if(foundGame === null){
      throw "Game not found";
    }
    if(!foundGame|| foundGame.games.length === 0){
      throw "The game is not found";
    };
    //console.log(foundGame.games);
    //Returns one element only, and not an array. [0] returns element
    return foundGame.games[0];
  },

  async updateGame (gameId, updateObject) {
    gameId = validation.checkId(gameId, "Game Id");
    //Create an object to hold updates
    const updateObjectData = {};
    const teamCollection = await teams();
    let teamWithGame = await teamCollection.findOne(
      //In '' because it is a subdocument
      //Search all mongodb games for passed in Id
      {'games._id': new ObjectId(gameId)});

      // console.log(teamWithGame.name);
    //   //Find opposing team 
    // let opposingWithGame = await teamCollection.findOne(
    //   //In '' because it is a subdocument
    //   //Search all mongodb games for passed in Id
    //   {'games.opposingTeamId': new ObjectId(teamWithGame.opposingTeamId)});
    //   console.log("Line 125");
    // //const gamethatPosted = await teamData.getTeamById(updateObject.teamId);
    if(!teamWithGame){
      throw "Game for post not found";
    };

    // // if(!opposingWithGame){
    // //   throw "Opposing team Id not found";
    // // };

    const foundGame = teamWithGame.games.find(game => game._id.equals(
      new ObjectId(gameId)
    ));

    // if(!foundGame){
    //   throw " Game not found in team's games"
    // }
    // const primaryTeamId = teamWithGame.id
    // const opposingTeamId = foundGame.opposingTeamId;

    if(updateObject.opposingTeamId){
      
    const opposingWithGame = await teamCollection.findOne(
      {_id: new ObjectId(opposingTeamId)}
    )

    if (!opposingWithGame){
      throw "Opposing team not found"
    }

   
    //2. Get the team for teamId and opposingTeamId
    //If both teams sports are not equal, throw error
    let team1 = await teamData.getTeamById(primaryTeamId);
    let team2 = await teamData.getTeamById(opposingTeamId);
    if(!team1 || !team1.sport || !team2 || !team2.sport || team1 === team2){
      throw "Both team1 and team2 must have a sport defined and not same team"
    }
    if(team1.sport.toLowerCase() !== team2.sport.toLowerCase()){
      throw "The two teams must be in the same sport"
    }
  }

    if(updateObject.gameDate){
      updateObjectData.gameDate = validation.isValidDateFormat(
        updateObject.gameDate
      );
    };

    if(updateObject.opposingTeamId){
      updateObjectData.opposingTeamId = validation.checkId(
        updateObject.opposingTeamId, 
        'Opposing Team Id'
      );
    };

    if(updateObject.homeOrAway){
        updateObjectData.homeOrAway = validation.checkString(updateObject.homeOrAway, 
          "Home Or Away");
      validation.checkHomeOrAway(updateObject.homeOrAway);
    };
    //Set valid homeOrAway in the updateObjectData
    //updateObjectData.homeOrAway = updateObject.homeOrAway;

    if(updateObject.finalScore){
      updateObjectData.finalScore = validation.checkFinalScore(
      updateObject.finalScore
      );
    };

    if(updateObject.win){
      if(typeof updateObjectData.win !== "boolean"){
        throw "win value is not a boolean-update game"
      }
      updateObjectData.win = updateObject.win;
    };

    // if(win){
    //   team1.winLossCount = validation.addWin(team1.winLossCount);
    // }else{
    //   team1.winLossCount = validation.addLoss(team1.winLossCount);
    // };

    //3. Establish connection with database
    //const teamCollection = await teams();
    
    
    const myString = validation.buildUpdateString(updateObjectData);

    let updatedGame = await teamCollection.findOneAndUpdate(
      //{'games._id': new ObjectId(gameId)}),
      {'_id': teamWithGame._id, 'games._id': new ObjectId(gameId)},//DID THIS WORK
    //  {$set: {'games.$.finalScore': "99-99"}},
       myString,
      {returnDocument: 'after'}
      //Now we have an updated post
    );

    if(!updatedGame){
      throw `Could not update the post with id ${id}`;
    };
    return updatedGame;
  },

    async removeGame (gameId) {
    if (gameId === undefined) throw 'No game id provided';
    gameId = validation.checkId(gameId);
    const teamCollection = await teams();

    //Find the team with the game of specific game Id
    //The game is in the database
    let teamWithGame = await teamCollection.findOne(
      //In '' because it is a subdocument
      //Search all mongodb games for passed in Id
      {'games._id': new ObjectId(gameId)});

      if(!teamWithGame){
        throw "No team found with that specified Id"
      }

    //Retrieve the game object to remove
    const gameToRemove = teamWithGame.games.find(game => game._id.toString() === gameId);
    if(!gameToRemove){
      throw "Game not be retrieved from database";
    }

      //Store the parent teamId in a variable
      let teamId = teamWithGame._id;

      //Remove the game with the specified gameId from the games array
      const updateResult = await teamCollection.updateOne(
        {_id: teamId},
        {$pull: {games: {_id: new ObjectId(gameId)}}}
      );

      if(updateResult.modifiedCount === 0){
        throw "Failed to remove the game"
      }
    //When a game is deleted, you will need to recalculate
    // the win loss count 
    let winCount = teamWithGame.winLossCount ? parseInt(teamWithGame.winLossCount.split('-')[0]) : 0;
    let lossCount = teamWithGame.winLossCount ? parseInt(teamWithGame.winLossCount.split('-')[1]) : 0;

    if(gameToRemove.win){
      //Decrement win if game removed was a win
      winCount = Math.max(0, winCount -1); 
    } else{
      //Decrement loss if game removed was a loss
      lossCount = Math.max(0, lossCount -1);
    }

    let countSplit = `${winCount}-${lossCount}`;
    //Update the team with the new win loss 
    await teamCollection.updateOne(
      {_id: teamId},
      {$set: {winLossCount: countSplit}}
    );

    //Return the updated team document with the game removed
    const updatedTeam = await teamCollection.findOne({_id: teamId});
    return updatedTeam;
  }
};
export default exportedMethods;