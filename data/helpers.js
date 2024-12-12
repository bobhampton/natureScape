import { ObjectId } from 'mongodb'
import { users } from '../config/mongoCollections.js'

const exportedMethods = {
  checkId (id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`
    id = this.checkString(id, varName)
    // if (typeof id !== 'string') throw `Error:${varName} must be a string`;
    // id = id.trim();
    // if (id.length === 0)
    //   throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`
    return id
  },

  checkString (strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`
    strVal = strVal.trim()
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`
    return strVal
  },

  checkAgreement (agreedStatement) {
    if (agreedStatement !== true || !agreedStatement) {
      throw new Error(
        'The user has not yet agreed to terms and conditions consent form'
      )
    } else {
      agreedStatement = true
      return agreedStatement
    }
  },

  //Taking in a number type
  checkCreation_time (timeStamp) {
    if (typeof timeStamp !== 'number' || isNaN(timeStamp)) {
      throw new Error('The time stamp is invalid')
    }
  },

  checkUser (
    firstName,
    lastName,
    userEmail,
    userName,
    passwordHash,
    agreement,
    bio,
    role
  ) {
    firstName = this.checkName(firstName, 'firstName')
    lastName = this.checkName(lastName, 'lastName')
    //userEmail = this.validateEmail(userEmail)
    userName = this.checkString(userName, 'userName')
    // passwordHash?
    agreement = this.checkAgreement(agreement)
    bio = this.checkString(bio, 'bio')
    if (role) {
      role = this.checkRole(role, 'role')
    }
    return {
      firstname: firstName,
      lastname: lastName,
      email: userEmail,
      username: userName,
      passwordhash: passwordHash,
      bio: bio,
      role: role
    }
  },

  checkRole (role, varName) {
    if (!role) throw `Error: You must provide a ${varName}`
    role = this.checkString(role, varName)
    role = role.toLowerCase()
    if (role !== 'admin' && role !== 'user')
      throw `Error: ${varName} must be either 'admin' or 'user'`
    return role
  },

  checkName (name, varName) {
    if (!name) throw `Error: You must provide a ${varName}`
    name = this.checkString(name, varName)
    if (!/^[a-zA-Z]+$/.test(name))
      throw `Error: ${varName} must only contains letters!`
    return name
  },

  validateEmail (email) {
    email = this.checkString(email, 'email')
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email || typeof email !== 'string' || !emailReg.test(email)) {
      throw 'You must provide a valid email address'
    }
    return email.trim().toLowerCase()
  },

  buildUpdateString (updateFields) {
    const updateObject = { $set: {} }
    for (const field in updateFields) {
      let tempString = 'profile.$.' + field
      updateObject.$set[tempString] = updateFields[field]
    }

    return updateObject
  },

  profileCheckInputs (userIds, bios) {
    let returnstuff = {}
    this.checkId(userIds, 'userId')
    //ADD functionality to checkID to make sure the user Id is found in the data base
    //Added in line of function due to await.

    this.checkString(bios, 'bio ')

    returnstuff = { userId: userIds, bio: bios }

    return returnstuff
  }
}

export default exportedMethods
