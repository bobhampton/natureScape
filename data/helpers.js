import {ObjectId} from 'mongodb';


const exportedMethods = {
    checkId(id, varName) {
        if (!id) throw `Error: You must provide a ${varName}`;
        if (typeof id !== 'string') throw `Error:${varName} must be a string`;
        id = id.trim();
        if (id.length === 0)
          throw `Error: ${varName} cannot be an empty string or just spaces`;
        if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
        return id;
      },

      checkString(strVal, varName) {
        if (!strVal) throw `Error: You must supply a ${varName}!`;
        if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
        strVal = strVal.trim();
        if (strVal.length === 0)
          throw `Error: ${varName} cannot be an empty string or string with just spaces`;
        if (!isNaN(strVal))
          throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
        return strVal;
      },

      checkAgreement(agreedStatement){
        if (agreedStatement !== true || !agreedStatement){
            throw new Error ("The user has not yet agreed to terms and conditions consent form");
        }
      },

      //Taking in a number type
      checkCreation_time(timeStamp){
        if(typeof timeStamp !== 'number' || isNaN(timeStamp)){
            throw new Error ("The time stamp is invalid");
        }
      },

      checkUser(firstName, lastName, userEmail, userName,
        passwordHash){
            if(!firstName){
                throw "You must provide a first name";
            };
            if(typeof firstName !== 'string'){
                throw "You must provide a first name"
            };
            firstName = firstName.trim();
            if(firstName.length === 0){
                throw "The first name cannot be empty of just spaces";
            };

            if(!lastName){
                throw "You must provide a last name";
            };
            if(typeof lastName !== 'string'){
                throw "You must provide a last name"
            };
            lastName = lastName.trim();
            if(firstName.length === 0){
                throw "The last name cannot be empty of just spaces";
            };

            if(!userEmail){
                throw "You must provide an email";
            };
            if(typeof userEmail !== 'string'){
                throw "The email must be a string"
            };
            userEmail = userEmail.trim();
            if(userEmail.length === 0){
                throw "The email cannot be empty of just spaces";
            };
            this.validateEmail;

            if(!userName){
                throw "You must provide an username";
            };
            if(typeof userName !== 'string'){
                throw "The username must be a string"
            };
            userName = userName.trim();
            if(userName.length === 0){
                throw "The username cannot be empty of just spaces";
            };

            if(!passwordHash){
                throw "You must provide an email";
            };
            if(typeof passwordHash !== 'string'){
                throw "The password must be a string"
            };
            passwordHash = passwordHash.trim();
            if(passwordHash.length === 0){
                throw "The password cannot be empty of just spaces";
            };

            if(userName.toLowerCase() === passwordHash.toLowerCase()){
                throw "The userName cannot be the same as your password"
            }
        },

        validateEmail (email){
            return String(email)
              .toLowerCase()
              .match(
                /^(([^<>()[]\.,;:\s@"]+(.[^<>()[]\.,;:\s@"]+)*)|.(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/
              );
        }

}