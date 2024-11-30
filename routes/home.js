import express from 'express'

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (req.sesstion.user) {
      return res.status(200).render('home/home', { title: "NatureScape" , css: "/public/css/home.css", js: "/public/js/home.js"});
    } else {
      return res.status(200).render('home/login', { title: "NatureScape" , css: "/public/css/home.css", js: "/public/js/login.js"});
    }

  } catch (error) {
    res.status(500).json({error: error});
  }
});

export default router;