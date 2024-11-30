import { checkUser, checkPassword } from "../data/login.js"
import express from "express"

const router = express.Router();

//GET home page login page template
router
  .route('/')
  .get(async (req, res) => {
    //Render landing page with login
    try {
      if (req.session.user) {
        return res.status(200).render('home/home', { 
          title: "NatureScape" , 
          css: "/public/css/home.css", 
          js: "/public/js/home.js"
        });
      } else {
        req.method = 'POST'
        return res.status(200).render('home/login', { 
          title: "NatureScape" , 
          css: "/public/css/home.css", 
          js: "/public/js/login.js"
        });
      }        
    } catch (error) {
        res.status(500).json({error: error});
    }
  });

//POST for login logic
router
  .route('/')
  .post(async (req, res) => {
    //Get username and password from req.body
    const {username, password} = req.body;
    const user = await checkUser(username);
    const match = await checkPassword(username, password);
    
    if (match) {
      req.session.isAuth = true;
      req.session.user = user;
      res.redirect(`users/${user._id}`);
    } else {
      res.render('home/login', {
        title: "NatureScape", 
        css: "/public/css/home.css", 
        js: "/public/js/login.js", 
        loginMessage: "Incorrect credentials" });
    }
  });

router
  .route('/checkUser')
  .post(async (req, res) => {
    try {
      const { username } = req.body;
      const userExists = await checkUser(username);
      res.json({ exists: userExists });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

router
  .route('/checkPassword', async (req, res) => {
    try {
      const { username, password } = req.body;
      const isValid = await checkPassword(username, password);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ error: error.message});
    }
  })

export default router