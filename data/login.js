import express from 'express';
import bcrypt from 'bcryptjs';

//Test password
let testPassword = "myTestPassword";
let saltRounds = 16;
let testPasswordHash = bcrypt.hash(testPassword, saltRounds);

const userCollection = await users();

async function checkUser(username) {
    let userFound = await userCollection.findOne(
        { 'username': username}
    )
    if (userFound === null) {
        throw "User not found";
    }
    
    return userFound;

};

const checkPassword = async (username, password) => {
    //let userFound = await checkUser(username);
    //let storedPasswordHash = userFound.password_hash;
    let storedPasswordHash = testPasswordHash;
    
    let compareToMatch = false;
    
    try {
        compareToMatch = bcrypt.compare(password, storedPasswordHash);
    } catch (error) {
        //no op
    }
    
    return compareToMatch;
};

export {
    checkUser,
    checkPassword
};