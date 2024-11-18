import { users } from "../config/mongoCollections";
import {ObjectId} from 'mongodb';
import bcrypt from 'bcryptjs';
import validation from './helpers.js';

const exportedMethods = {
    async createUser(first_name,
         last_name,
         email,
         username,
         password_hash,
         ){
            // Validate inputs
    const newUser = validation.checkUser(first_name, last_name, email, username, password_hash);

    const theCurrentDate = new Date();
    const year = theCurrentDate.getFullYear();
    const month = theCurrentDate.getMonth() + 1;
    const day = theCurrentDate.getDate();

    const creationDate = month + "/" + day + "/" + year;

    // Set additional fields for the new user
    const userData = {
      ...newUser,
      creationDate: creationDate,
      profile: {
        //FIX WHAT A profile subdocument means 
        bio: ' ',
        profile_picture: profile_picture
      },
    };

    // Insert user into database
    const userCollection = await users();
    //Inserting the new data.
    const insertInfo = await userCollection.insertOne(userData);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add the new user";

    // Return the newly added user
    return await this.getuserById(insertInfo.insertedId.toString());
},

async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection.find({}).project({ _id: 1, first_name: 1, last_name: 1 }).toArray();
    if (!userList) throw "Couldn't get all users";
    return userList;
},

async getUserById(id) {
    //console.log("getTeamById")
    id = validation.checkId(id, "id");
    const objId = ObjectId.createFromHexString(id);
    const userCollection = await users();
    const myUser = await userCollection.findOne({ _id: objId });
    if (!myUser) throw "No user found with the given ID";
    return myUser;
},

async removeUser(id) {
    id = validation.checkId(id);
    const userCollection = await users();
    const deletionInfo = await userCollection.findOneAndDelete({ _id: ObjectId.createFromHexString(id) });
    if (!deletionInfo) throw `Could not delete the user with an id of ${id}`;
    return deletionInfo;
  },

  // Update User
  async updateUser(id, first_name, last_name, email, username, password) {
    // Validate the user ID
    id = validation.checkId(id);

    // Validate the input fields (ensuring they are correct and well-formed)
    validation.checkString(first_name, 'First Name');
    validation.checkString(last_name, 'Last Name');
    validation.checkString(email, 'Email');
    validation.checkString(username, 'Username');
    
    // Prepare updated data
    const updatedUser = {};

    if (first_name) updatedUser.first_name = first_name.trim();
    if (last_name) updatedUser.last_name = last_name.trim();
    if (email) updatedUser.email = email.trim();
    if (username) updatedUser.username = username.trim();

    // If password is provided, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedUser.password_hash = hashedPassword;
    }

    // Get the users collection and update the user
    const userCollection = await users();
    const updatedInfo = await userCollection.findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $set: updatedUser },
      { returnDocument: 'after' }
    );

    if (!updatedInfo.value) throw "Could not update the user successfully";
    
    return updatedInfo.value;  // Return the updated user
  }



  /*async updateTeam(id, first_name, last_name, email, userName, password_hash) {
    validation.checkId(id);
    validation.checkString(first_name);
    validation.checkString(last_name);
    validation.checkString(email);
    validation.checkString(userName);
    validation.checkString(password_hash);
    //validation.check email


    const currentYear = new Date().getFullYear();
    if (typeof yearFounded !== 'number' || !Number.isInteger(yearFounded) || yearFounded < 1850 || yearFounded > currentYear) {
      throw "The year founded must be an integer between 1850 and the current year";
    }

    validation.checkString(city);
    validation.checkString(state);

    const fiftyStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
      'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE',
      'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
      'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
    if (state.trim().length !== 2 || !fiftyStates.includes(state.toUpperCase().trim())) throw "Invalid state code";

    validation.checkString(stadium);

    if (typeof championshipsWon !== 'number' || !Number.isInteger(championshipsWon) || championshipsWon < 0) {
      throw "Championships won must be a non-negative integer";
    }

    if (!Array.isArray(players) || players.length === 0 || !players.every(player => {
      return typeof player === 'object' && player !== null &&
        typeof player.firstName === 'string' && player.firstName.trim() &&
        typeof player.lastName === 'string' && player.lastName.trim() &&
        typeof player.position === 'string' && player.position.trim();
    })) throw "Players must be an array of non-null objects with valid firstName, lastName, and position";
console.log("7")
    // Prepare updated team data
    const updatedTeam = {
      name,
      sport,
      yearFounded,
      city,
      state: state.toUpperCase().trim(),
      stadium,
      championshipsWon,
      players: players.map(player => ({
        firstName: player.firstName.trim(),
        lastName: player.lastName.trim(),
        position: player.position.trim()
      }))
    };

    console.log("8")
    const teamCollection = await teams();
    console.log("9")
    const updatedInfo = await teamCollection.findOneAndUpdate(
      //const updatedInfo = await teamCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedTeam },
      { returnDocument: 'after' }
    );
    console.log("6 ")
    if (!updatedInfo) {
      throw 'Could not update the team successfully';
    }

    console.log("made it here 5")
    //updatedInfo = await teamData.getTeamById(id.toString());
    //return updatedInfo;
    //console.log("updatedInfo", updatedInfo)
    console.log(id)
    //let test = await getTeamById(id);
    const test = await teamCollection.findOne({_id: ObjectId.createFromHexString(id)});
    
    console.log("updatedInfo._id", updatedInfo._id)
    console.log("test", test)
    return test;*/
  }
