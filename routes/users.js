import { Router } from 'express'
import userData from '../data/users.js'
import validation from '../data/helpers.js'
import { users } from '../config/mongoCollections.js'

const router = Router()

router
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
  .get(async (req, res) => {
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
      css: '/public/css/newUser.css'
    });
  } catch (e) {
    return res.sendStatus(400).json({error: e});
  }
  })

  //When they submit the form
  .post(async (req, res)=>{
    try {
      const userInput = {
        firstname: validation.checkString(req.body.firstname,"First Name"),
        lastname: validation.checkString(req.body.lastname, "Last Name"),
        email: validation.validateEmail(req.body.email),
        username: validation.checkString(req.body.username, "Username"),
        password: validation.checkString(req.body.password),
        terms: req.body.terms
        //bio: validation.checkString(req.body.bio, "Biography")
      }

      //Add new user to the database
      const newUser = await userData.createUser(userInput);

      //Redirect to the login page to go to the login page route
      res.redirect('/'); 

    } catch (e) {
      res.status(400).render('users/user',{
        title: "New User Entry",
        css: "/public/css/newUser.css",
        error: e
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
      res.render('profilePage/newUser', {
        css: '/public/css/profile.css',
        newUser: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
          password_hash: user.password_hash,
          creation_time: user.creation_time,
          agreement: user.agreement,
          profile: {
            bio: user.profile.bio,
            profile_picture: {
              data: user.profile.profile_picture.data.toString('base64'),
              contentType: user.profile.profile_picture.contentType
            }
          }
        }
      })
    } catch (e) {
      return res.status(404).json({ error: 'User not found' })
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
