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
  })

//POST for login logic
  .post(async (req, res) => {
    //Get username and password from req.body
    //const {username, password} = req.body;
    try {
      const username = req.body.uname;
      const password = req.body.passwd;
      const user = await checkUser(username);
      const match = await checkPassword(user.username, password);
      
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
    } catch (error) {
      res.status(400).render('home/login', {
        title: "NatureScape",
        css: "/public/css/home.css",
        js: "/public/js/login.js",
        loginMessage: "Inorrect credentials"
      })
    }
    
  }); 

//GET for logout
router
  .route('/logout')
  .get(async (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error('Error destroying session:', error);
        res.status(500).send("Error logging out");
      } else {
        res.clearCookie('session-cookie');
        res.redirect('/login');
      }
    });
  });

//Route for client side js to fetch for authentication
router
  .route('/checkUser')
  .post(async (req, res) => {
    try {
      const { username } = req.body;
      await checkUser(username);
      res.json({ exists: true });
    } catch (error) {
      res.status(500).json({ exists: false });
    }
  })

router
  .route('/checkPassword', async (req, res) => {
    try {
      const { username, password } = req.body;
      const isValid = await checkPassword(username, password);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ valid: false });
    }
  })

export default router;