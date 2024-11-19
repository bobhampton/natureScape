import express from 'express';
import bcrypt from 'bcryptjs';
const saltRounds = 16;

const plainTextPassword = 'my_password';
const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

function loginMiddleware(req, res, next) {

}

let compareToSherlock = false;

try {
    compareToSherlock = await bcrypt.compare('elementarymydearwatson', hashedPassword);
} catch (error) {
    //no op
}

if (compareToSherlock) {
    console.log("The passwords match... This should not be");
} else {
    console.log('The passwords do not match');
}

let compareToMatch = false;

try {
    compareToMatch = await bcrypt.compare('my_password', hash);
} catch (error) {
    //no op
}

if (compareToMatch) {
    console.log("THe passwords match... This is good");
} else {
    console.log('The passwords do not match, this is not good, they should match');
}