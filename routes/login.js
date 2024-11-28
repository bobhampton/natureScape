import { checkUser, checkPassword } from "../data/login.js"
import express from "express"

const router = express.Router();

//GET home page login page template
router.get('/', async (req, res) => {
    //Render landing page with login
    try {
        res.status(200).render('home/home', { title: "NatureScape" , css: "/public/css/home.css", js: "/public/js/login.js"});
    } catch (error) {
        res.status(500).json({error: error});
    }
});

//POST for login logic
router.post('/login', async (req, res) => {
    //Get username and password from req.body
    const {username, password} = req.body;
    const user = await checkUser(username);

    let match = await checkPassword(username, password);
    
    if (match) {
      req.session.user = user;
      res.redirect(`profilePage/userProfile/${user._id}`);
    } else {
      res.render('home/home', {title: "NatureScape", css: "/public/css/home.css", js: "/public/js/login.js", loginMessage: "Incorrect credentials" });
    }
    
});

export default router