import { Router } from 'express'
import userData from '../data/users.js'
import validation from '../data/helpers.js'
import { users, photos } from '../config/mongoCollections.js'
import bcrypt from 'bcryptjs'
import {checkInputUsername, checkInputEmail, checkDuplicateId} from './helpers.js'
import { createFeedback, getAllFeedback } from '../data/feedback.js'
import { authorizeRole, checkXss} from '../middleware.js'



const router = Router();



// router
//   .route('/') //Localhost:3000/users/   --Gets all users--
//   .get(authorizeRole('admin'), async (req, res) => {// Protect this route with admin role
//     //No inputs to validate
//     try {
//       let userList = await userData.getAllUsers()
//       // .find({})
//       // .project({_id: 1, name: 1,})
//       // .toArray();
//       return res.json(userList)
//     } catch (e) {
//       return res.status(404).render("error", {error: e, 
//         title: ""
//       })
//     }
//   })


router
  .route('/newUser')
  //How to get to the newUser form
  .get(async(req, res)=>{
  try {
    return res.render('users/user',{
      title: "Create New User",
      css: '/public/css/newUser.css'
    });
  } catch (e) {
    return res.status(400).render({error: e, title: "New User",
       css: '/public/css/newUser.css'});  }
  })

  //When they submit the form
  .post(checkXss, async (req, res)=>{
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

      //Storing the username in the db as a lowercase value
      userInput.username = userInput.username.toLowerCase()

      
      //Ensure the username is not already taken
      if (!checkInputUsername || !checkInputEmail) {
        throw 'checkUsername or checkEmail'
      }
     // try{
      //await checkInputUsername(userInput.username);
      //await checkDuplicateId(userInput.username);
      //await checkInputEmail(userInput.email);
      //}catch(e){
        //res.status(400).redirect('/newUser', {error: e})
      //}
      //Add new user to the database
      let returnCreate = await userData.createUser(
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
      if(!req.session.user){
        return res.redirect('/login');
      }
      req.params.userId = validation.checkId(
        req.params.userId,
        'Id of URL param'
      )
    } catch (e) {
      return res.status(400).render("error",{ title: "User Profile", 
        css: "/public/css/newUser.css",
        error: e })
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
        title: 'Profile',
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
        feedback: userFeedback,
        //session: req.session
      })
    } catch (e) {
      return res.status(404).render("error",{ title: "New User",
        css: "/public/css/newUser.css",
        error: 'User not found' })
    }
  })
  .post(checkXss, async (req, res) => {
    try {
      const userId = validation.checkId(req.params.userId, 'User ID');
      const feedbackInput = validation.checkString(req.body.feedback, 'Feedback');

      await createFeedback(feedbackInput, userId);
      
      res.redirect(`/users/${userId}`);
      } catch (e) {
      console.error(e);
      res.status(400).render('error', { error: e, css: '/public/css/error.css', title: "Error", message: "Message: Already submitted Feedback" });
  }});

export default router
