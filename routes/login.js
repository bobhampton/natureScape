import { users } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb"
import * as login from "/data/login.js"
import express from "express"

const router = express.Router();

//GET home page login page template
router.get('/', async (req, res) => {
    //Render landing page with login
    try {
        res.status(200).render('home/home', { title: "NatureScape" });
    } catch (error) {
        res.status(500).json({error: error});
    }
});

//POST for login logic
router.post('/login', async (req, res) => {
    //Handle login logic and redirect

    let match = bcrypt.compare(password, 'HASHED_PW_FROM_DB');
    //Phony username
    req.session.user = {firstName: 'John', lastName: 'Doe', userId: '123'};
    res.redirect('/private');
});

export default router