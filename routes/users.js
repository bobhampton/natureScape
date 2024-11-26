import { Router } from "express";
import userData from '../data/users.js'
import validation from '../data/helpers.js'

const router = Router();

router
.route('/')//Localhost:3000/users/   --Gets all users--
  .get(async (req, res) => {
    //No inputs to validate
    try{
      let userList = await userData.getAllUsers()
      // .find({})
      // .project({_id: 1, name: 1,})
      // .toArray();
      return res.json(userList);
    }catch(e){
      return res.sendStatus(404).send(e);
    }
  })
  .post(async (req, res) => {
    //code here for POST
    let userinfo = req.body;
    if(!userinfo || Object.keys(userinfo).length === 0){
      return res
        .status(400)
        .json({error: "There are no fields in the request body"});
    }

  try{
    //teaminfo is the information in the request body
    validation.checkUser(firstname, lastname, email, username, password_hash);
  }catch(e){
      return res.status(400).json({error: e});
  };

  try{
    const newUser = await userData.createUser(firstname, lastname, email, username, password_hash);

      res.status(200).json(newUser);
  }catch(e){
      res.sendStatus(400).json({error: e});
  }
  });

router
  .route('/:userId')//localhost:3000/teams/507f1f77bcf86cd799439011  --teamID is 507f1f77bcf86cd799439011--
  .get(async (req, res) => {
    //code here for GET
    try{
      req.params.userId = validation.checkId(req.params.userId, "Id of URL param");
    } catch(e){
      return res.status(400).json({error: e});
    }

    try{
      let user = await userData.getUserById(req.params.userId);

      return res.status(200).json(user);
    }catch(e){
      return res.status(404).json({error: "User not found"});
    }
  })
  .delete(async (req, res) => {
    //code here for DELETE
    try{
      req.params.userId = validation.checkId(req.params.userId);
    }catch(e){
      return res.status(400).json({error: e});
    }

    try{
      let deletedUser = await userData.removeUser(req.params.teamId);

      return res.status(200).json({_id:req.params.userId, deleted: true});
    }catch(e){
      //JSON always returns a string
      return res.status(404).json({error: e});
    }
  })
  .put(async (req, res) => {
    //console.log("made it here")
    const userinfo = req.body;
    //code here for PUT
    if(!userinfo || Object.keys(userinfo).length === 0){
      return res
        .status(400)
        .json({error: "There are no fields in the request body"});
    }

    try{
      //console.log("made it here")
      req.params.userId = validation.checkId(req.params.userId);
      validation.checkUser(firstname, lastname, email, username, password_hash);
    }catch{
      return res.status(400).json({error: e});
    }

    try{
      //console.log("made it here3")
      let updateduser = await userData.updateTeam(req.params.userId,
        userinfo.firstname,
        userinfo.lastname,
        userinfo.email,
        userinfo.username,
        userinfo.password_hash
        );

      //Explicit display of 200 status.
      //console.log("made it here4")
      return res.status(200).json(updateduser); 
    }catch(e){
      return res.status(404).json({error:e});
    }
  });
export default router;