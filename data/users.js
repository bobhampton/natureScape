import { users } from "../config/mongoCollections";
import {ObjectId} from 'mongodb';
import validation from './helpers.js';

const exportedMethods = {
    async createUser(
         first_name,
         last_name,
         email,
         username,
         password_hash,
         ){
            // Validate inputs
    const newUser = validation.checkUser(first_name, last_name, email, username, password_hash, bio);

    const theCurrentDate = new Date();
    //console.log(theCurrentDate);
    //Numeric
    const year = theCurrentDate.getFullYear();
    const month = theCurrentDate.getMonth() + 1; //Months begin at index 0 so start at one
    const day = theCurrentDate.getDate();

    const creationDate = month + "/" + day + "/" + year; //Now a string

    // Set additional fields for the new user
    const userData = {
      ...newUser,
      creationDate: creationDate,
      profile: {
        
        bio: "",
      },
    };

    // Insert user into database
    const userCollection = await users();
    //Inserting the new data.
    const insertInfo = await userCollection.insertOne(userData);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add the new team";

    // Return the newly added team
    return await this.getuserById(insertInfo.insertedId.toString());
},

async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection.find({}).project({ _id: 1, name: 1 }).toArray();
    if (!userList) throw "Couldn't get all the users";
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

  async updateUser(id, userInfo) {//Works like a patch
    id = validation.checkId(id, 'user id');
    
    if(userInfo.first_name){
      userInfo.first_name = validation.checkString(
        userInfo.first_name, 'first name'
      );
    };

    if(userInfo.last_name){
      userInfo.last_name_name = validation.checkString(
        userInfo.last_name, 'last name'
      );
    };

    if(userInfo.email){
      userInfo.email = validation.checkString(
        userInfo.email, 'email'
      );
    };

    if(userInfo.username){
      userInfo.username = validation.checkString(
        userInfo.username, 'username'
      );
    };

    if(userInfo.password_hash){
      userInfo.password_hash = validation.checkString(
        userInfo.password_hash, 'user password'
      );
      //Don't want 103 if prior hash
      //userInfo.password_hash = await bcrypt.hash(userInfo.password_hash, 10);
    };
  
    //Establish connection to the database
    const userCollection = await users();
    
    const updatedInfo = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: userInfo },
      { returnDocument: 'after' }
    );

    if (!updatedInfo) {
      throw 'Could not update the user successfully';
    }

    return updatedInfo;
  }

};

export default exportedMethods;