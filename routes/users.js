import { Router } from 'express'
import userData from '../data/users.js'
import validation from '../data/helpers.js'
import { users, photos } from '../config/mongoCollections.js'
import bcrypt from 'bcryptjs'
import {checkInputUsername, checkInputEmail, checkDuplicateId} from './helpers.js'
import { createFeedback, getAllFeedback } from '../data/feedback.js'
import { authorizeRole } from '../middleware.js'

const router = Router();

// .route('/')//Localhost:3000/users/   --Gets all users--
//   .get(async (req, res) => {
//     //No inputs to validate
//     try{
//       let userList = await userData.getAllUsers()
//       // .find({})
//       // .project({_id: 1, name: 1,})
//       // .toArray();
//       return res.json(userList);
//     }catch(e){
//       return res.sendStatus(404).send(e);
//     }
//   })
//   .post(async (req, res) => {
//     //code here for POST
//     // const {firstname, lastname, email, username, password_hash} = req.body;
//     // if(!firstname || !lastname || !email || !username || !password_hash){
//     //   return res.status(400).render('users/user', {error : "Missing fields"});
//     // }
//     let userinfo = req.body;
//     if(!userinfo || Object.keys(userinfo).length === 0){
//       return res
//         .status(400)
//         .render("users/user",{error: "There are no fields in the request body"});
//     }

//   try{
//     firstname = userinfo.firstname;
//     lastname = userinfo.lastname;
//     email = userinfo.email;
//     username = userinfo.username;
//     password_hash = userinfo.password_hash;

//     //userInfo is the information in the request body
//     validation.checkUser(firstname, lastname, email, username, password_hash);
//   }catch(e){
//       return res.status(400).render('users/user',{error: e});
//   };

//   try{
//     const newUser = await userData.createUser(firstname, lastname, email, username, password_hash);

//     return res.redirect(`../profilePage/${newUser._id}`);
//   }catch(e){
//     return res.sendStatus(400).json({error: e});
//   }
//   });

router
  .route('/') //Localhost:3000/users/   --Gets all users--
  .get(authorizeRole('admin'), async (req, res) => {// Protect this route with admin role
    //No inputs to validate
    try {
      let userList = await userData.getAllUsers()
      // .find({})
      // .project({_id: 1, name: 1,})
      // .toArray();
      return res.json(userList)
    } catch (e) {
      return res.sendStatus(404).send(e)
    }
  })

router
  .route('/newUser')
  //How to get to the newUser form
  .get(async(req, res)=>{
  try {
    return res.render('users/user',{
      title: "Create a New User",
      css: '/public/css/newUser.css'
    });
  } catch (e) {
    return res.sendStatus(400).json({error: e});
  }
  })

  //When they submit the form
  .post(async (req, res)=>{
    try {
      const isChecked = req.body.tterms === "on"; //Meaning true
      const password = validation.checkString(req.body.tpassword)
      const userInput = {
        firstname: validation.checkString(req.body.tfirstname,"First Name"),
        lastname: validation.checkString(req.body.tlastname, "Last Name"),
        email: validation.validateEmail(req.body.temail),
        username: validation.checkString(req.body.tusername, "Username"),
        passwordhash: await bcrypt.hash(password, 16), //Encrypts the incoming password
        terms: isChecked,
        bio: validation.checkString(req.body.tbio, "Biography"),
        role: validation.checkString(req.body.trole, "Role") //Add role
      }

      
      //Ensure the username is not already taken
      await checkInputUsername(userInput.username);
      await checkDuplicateId(userInput.username);
      await checkInputEmail(userInput.email);

      //Add new user to the database
      await userData.createUser(
        //Making sure all values input from this route is going to the createUser function
        userInput.firstname,
        userInput.lastname,
        userInput.email,
        userInput.username,
        userInput.passwordhash,
        userInput.terms,
        userInput.bio,
        userInput.role 
      );
      //data/users.createUser never returns and object
      //const newUser = await userData.createUser(userInput);

      //Redirect to the login page to go to the login page route
      res.redirect('/login'); 
    } catch (e) {
      if(e === "The username is a duplicate"){//If change this message also change in route/helpers.checkInputUsername
        res.status(400).render('users/user',{
          title: "Choose a different username ",
          css: "/public/css/newUser.css",
          error: e,
          userInput: req.body // Send filled-out form data back
          });
      }else if(e === "This email is already registered"){
        res.status(400).render('users/user',{
          title: "Choose a different email",
          css: "/public/css/newUser.css",
          error: e,
          userInput: req.body // Send filled-out form data back
          });
        } else {
          console.log(e);
          console.log(e.message);
        }

        res.status(400).render('users/user',{
          title: "New User Entry",
          css: "/public/css/newUser.css",
          error: e,
          userInput: req.body //Send filled-out form data back
          });
      }
    });

router
  .route('/:userId') //localhost:3000/teams/507f1f77bcf86cd799439011  --teamID is 507f1f77bcf86cd799439011--
  .get(async (req, res) => {
    //code here for GET
    try {
      req.params.userId = validation.checkId(
        req.params.userId,
        'Id of URL param'
      )
    } catch (e) {
      return res.status(400).json({ error: e })
    }

    try {
      let user = await userData.getUserById(req.params.userId)
      let message;
      if(user.terms){
        message = "You agreed to the terms";         
      }else{
        message = "You have not yet agreed to the terms"
      }

      // Find all photos associated with the user
      const photoCollection = await photos()
      const userPhotos = await photoCollection.find({ user_id: user._id }).toArray()
      const formattedPhotos = userPhotos.map(photo => ({
        _id: photo._id,
        photo_name: photo.photo_name,
        photo_description: photo.photo_description,
        likes: photo.likes,
        views: photo.views,
        img: {
          data: photo.img.data.toString('base64'),
          contentType: photo.img.contentType
        }
      }))

      //Getting feedback
      const feedbackList = await getAllFeedback();
      const userFeedback = feedbackList.filter((fb) => fb.user.toString() === req.params.userId);

      res.render('profilePage/newUser', {
        //name on left is whatever I want.  Variables on right
        //come from the database in line 154
        css: '/public/css/profile.css',
        newUser: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
          password_hash: user.password_hash,
          creation_time: String(user.creationDate),
          agreement: message,
          profile: {
            bio: user.profile.bio,
            profile_picture: {
              data: user.profile.profile_picture.data.toString('base64'),
              contentType: user.profile.profile_picture.contentType
            }
          }
        },
        images: formattedPhotos,
        feedback: userFeedback
      })
    } catch (e) {
      return res.status(404).json({ error: 'User not found' })
    }
  })
  .post(async (req, res) => {
    try {
      const userId = validation.checkId(req.params.userId, 'User ID');
      const feedbackInput = validation.checkString(req.body.feedback, 'Feedback');

      await createFeedback(feedbackInput, userId);

      
      res.redirect(`/users/${userId}`);
    } catch (e) {
      console.error(e);
      res.status(400).render('error', { error: e });
    }
  })
  .delete(async (req, res) => {
    //code here for DELETE
    try {
      req.params.userId = validation.checkId(req.params.userId)
    } catch (e) {
      return res.status(400).json({ error: e })
    }

    try {
      let deletedUser = await userData.removeUser(req.params.teamId)

      return res.status(200).json({ _id: req.params.userId, deleted: true })
    } catch (e) {
      //JSON always returns a string
      return res.status(404).json({ error: e })
    }
  })
  .put(async (req, res) => {
    //console.log("made it here")
    const userinfo = req.body
    //code here for PUT
    if (!userinfo || Object.keys(userinfo).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' })
    }

    try {
      //console.log("made it here")
      req.params.userId = validation.checkId(req.params.userId)
      validation.checkUser(firstname, lastname, email, username, password_hash)
    } catch {
      return res.status(400).json({ error: e })
    }

    try {
      let updateduser = await userData.updateUser(
        req.params.userId,
        userinfo.firstname,
        userinfo.lastname,
        userinfo.email,
        userinfo.username,
        userinfo.password_hash
      )

      //Explicit display of 200 status.
      //console.log("made it here4")
      return res.status(200).json(updateduser)
    } catch (e) {
      return res.status(404).json({ error: e })
    }  
  })

export default router
