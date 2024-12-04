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
    let userFound = await userCollection.findOne(
        {'username' : username}
    )
    //Is this username taken?
    //console.log(typeof userFound);
    //console.log(userFound);
    if(userFound === null){
        //Goes into the database
        return;
    }
    if(typeof userFound === 'object'){
        throw "The username is a duplicate";
    }
    // userFound.username = userFound.toString();
    //console.log(typeof userFound);
    // //Check if username is already taken
    // if(userFound === username){
    //     throw "Unable to use that username"
    // } 
    // //Make sure the user is unable to create another profile
    // //due to variation of letters in the username.
    // if(userFound.toLowerCase() === username.toLowerCase()){
    //     throw "Username cannot be used"
    // }

}

export async function checkInputEmail(email){
    const userCollection = await users();
    let userFound = await userCollection.findOne(
        {'email': email}
    );
  
    if(userFound === null){
        //Goes into the database
        return;
    }
    if(typeof userFound === 'object'){
        throw "This email is already registered";
    }
} 