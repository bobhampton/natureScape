import { users } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb"
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
router.post('/', async (req, res) => {
    //Handle login logic and redirect
});

export default router