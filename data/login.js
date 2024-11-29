import express from 'express';
import { users } from '../config/mongoCollections.js';
import bcrypt from 'bcryptjs';

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
  let userFound = await checkUser(username);
  let storedPasswordHash = userFound.password_hash;
  
  let compareToMatch = false;
  
  try {
    compareToMatch = await bcrypt.compare(password, storedPasswordHash);
  } catch (error) {
    //no op
  }
  
  return compareToMatch;
};

export {
  checkUser,
  checkPassword
};