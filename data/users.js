import { users } from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import validation from './helpers.js'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const exportedMethods = {
  async createUser (firstname, lastname, email, username,
     passwordhash, terms, bio, role) {
    // Validate inputs
    const newUser = validation.checkUser(
      firstname,
      lastname,
      email,
      username,
      passwordhash,
      terms,
      bio,
      role
    )

    // Make sure username and email aren't already in the DB
    const userCollection = await users()
    if (await userCollection.findOne({ username: newUser.username })) {
      throw `Username ${newUser.username} already exists. Please choose a different user name.`
     } else if (await userCollection.findOne({ email: newUser.email })) {
      throw `Email ${newUser.email} already exists. Please choose a different email.`
    }

    // Get the current time in UTC
    const temp = Date.now()
    const uploadTimeStampUTC = (new Date(temp))

     // Setting up default profile picture
    const defaultProfilePicPath = path.join(
      __dirname,
      '../public/images/defaultProfilePhoto.png'
    )
    const profilePicData = fs.readFileSync(defaultProfilePicPath)
    const profilePic = {
      data: profilePicData.toString('base64'),
      contentType: 'image/jpeg'
    }
    
    // Set up all the data for the new user
    const userData = {
      //...newUser,
      first_name: newUser.firstname,
      last_name: newUser.lastname,
      email: newUser.email,
      username: newUser.username,
      password_hash: newUser.passwordhash,
      creationDate: uploadTimeStampUTC,
      terms: true,
      profile: {
        bio: newUser.bio,
        profile_picture: profilePic
      },
      role: newUser.role
    }

    // Add user to database
    //const userCollection = await users()
    const insertInfo = await userCollection.insertOne(userData)
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw `Could not add the new user: ${newUser.firstname} ${newUser.lastname}`

    // Can add return bool here if needed
  },

  async getAllUsers () {
    const userCollection = await users()
    const userList = await userCollection.find({}).toArray()
    const formattedUsers = userList.map(user => ({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      password_hash: user.password_hash,
      creationDate: user.creationDate,
      agreement: user.agreement,
      profile: {
        bio: user.profile.bio,
        profile_picture: {
          data: user.profile.profile_picture.data.toString('base64'),
          contentType: user.profile.profile_picture.contentType
        }
      }
    }))

    if (!userList) throw "Couldn't get all the users"
    //return userList;
    return formattedUsers
  },

  async getUserById (id) {
    //console.log("getTeamById")
    id = validation.checkId(id, 'id')
    const objId = ObjectId.createFromHexString(id)
    const userCollection = await users()
    const myUser = await userCollection.findOne({ _id: objId })
    if (!myUser) throw 'No user found with the given ID'
    return myUser
  },

  async removeUser (id) {
    id = validation.checkId(id)
    const userCollection = await users()
    const deletionInfo = await userCollection.findOneAndDelete({
      _id: ObjectId.createFromHexString(id)
    })
    if (!deletionInfo) throw `Could not delete the user with an id of ${id}`
    return deletionInfo
  },

  async updateUser (id, userInfo) {
    //Works like a patch
    id = validation.checkId(id, 'user id')

    if (userInfo.first_name) {
      userInfo.first_name = validation.checkString(
        userInfo.first_name,
        'first name'
      )
    }

    if (userInfo.last_name) {
      userInfo.last_name_name = validation.checkString(
        userInfo.last_name,
        'last name'
      )
    }

    if (userInfo.email) {
      userInfo.email = validation.checkString(userInfo.email, 'email')
    }

    if (userInfo.username) {
      userInfo.username = validation.checkString(userInfo.username, 'username')
    }

    if (userInfo.password_hash) {
      userInfo.password_hash = validation.checkString(
        userInfo.password_hash,
        'user password'
      )
      //Don't want 103 if prior hash
      //userInfo.password_hash = await bcrypt.hash(userInfo.password_hash, 10);
    }

    //Establish connection to the database
    const userCollection = await users()

    const updatedInfo = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: userInfo },
      { returnDocument: 'after' }
    )

    if (!updatedInfo) {
      throw 'Could not update the user successfully'
    }

    return updatedInfo
  }
}

export default exportedMethods
