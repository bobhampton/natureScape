//import express from 'express';
import { users } from "../config/mongoCollections.js";
import validation from "../data/helpers.js";

export function latLonToDecimal (lat, lon, latRef, lonRef) {
    // Convert GPS coordinates to decimal format
    let latitude = lat[0] + lat[1] / 60 + lat[2] / 3600;
    let longitude = lon[0] + lon[1] / 60 + lon[2] / 3600;
    if (latRef === 'S') {
        latitude = -latitude;
    }
    if (lonRef === 'W') {
        longitude = -longitude;
    }
    return { latitude, longitude };
};

export const findKeys = (obj, keys) => {
    let result = {};
    for (let key of keys) {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
    }
    for (let k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            let nestedResult = findKeys(obj[k], keys);
            result = { ...result, ...nestedResult };
        }
    }
    return result;
};

export async function checkInputUsername(username){
    const userCollection = await users();
    //Search users collection and find the 'username' in the 
    //collection that matches the incoming username
    username = username.toLowerCase()
    let userFound = await userCollection.findOne(
       // {'username' : username}
       //{username: {$regex: `^${username}$`, $options: `i`}});
       username
    )
    //User is not in the database
    if(userFound === null){
        //Insert user into the database
        console.log(`Username '${username}' is available.`);
        return true;
    }
    if(typeof userFound === 'object'){
        throw new "The username is a duplicate";
    }
    
}

export async function checkDuplicateId(incomingId){
    incomingId = incomingId.toLowerCase();
    const userCollection = await users();
      //Search users collection and find the 'userId' in the 
      //collection that matches the userId

      //Case insensitive search  
      //Checks for any casing in the database
      const user = await userCollection.findOne(
          {userId: {$regex: `^${incomingId}$`, $options: `i`}});
      //Is this userId taken?
      //console.log(typeof userFound);
      //console.log(userFound);
      if(!user){
          //No duplicate, proceed to add the new user
         return;
      }else{
        //If a match was found with a case insensitive search
        throw "Username cannot be used"
      }
};

export async function checkInputEmail(email){
    const userCollection = await users();
    let userFound = await userCollection.findOne(
        {'email': email}
    );
  
    if(userFound === null){
        //Goes into the database
        return true;
    }
    if(typeof userFound === 'object'){
        throw "This email is already registered";
    }
} 