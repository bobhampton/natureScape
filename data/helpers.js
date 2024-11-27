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

            if(!this.validateEmail(userEmail)){
                throw "You must provide a valid email";
            };
            if(typeof userEmail !== 'string'){
                throw "The email must be a string"
            };
            userEmail = userEmail.trim();
            if(userEmail.length === 0){
                throw "The email cannot be empty of just spaces";
            };

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
                throw "You must provide an password";
            };
            if(typeof passwordHash !== 'string'){
                throw "The password must be a string"
            };
            passwordHash = passwordHash.trim();
            if(passwordHash.length === 0){
                throw "The password cannot be empty of just spaces";
            };

            if(typeof agreement !== 'boolean'){
              throw "The agreement must be a boolean"
            }
            //If false
            if(!agreement){
              throw "You must check the box to agree to Terms And Conditions"
            }

        },

        validateEmail (email){
            const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if(!email || typeof email !== 'string' || !emailReg.test(email)){
                throw "You must provide a valid email address"
            }
            return email.trim().toLowerCase();
        },

        buildUpdateString(updateFields) {
            const updateObject = { $set: {} };
            for (const field in updateFields) {
              let tempString = "profile.$." + field;
              updateObject.$set[tempString] = updateFields[field];
            }
          
            return updateObject;
        },

        profileCheckInputs(
            userIds,
            bios
          ){
            let returnstuff = {};
            this.checkId(userIds, "userId");
            //ADD functionality to checkID to make sure the user Id is found in the data base
                //Added in line of function due to await. 
            
            this.checkString(bios, "bio ");
        
            returnstuff = {userId: userIds,
            bio: bios, 
            }
        
            return returnstuff;
          }

}

export default exportedMethods;