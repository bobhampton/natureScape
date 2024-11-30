import express from 'express'

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const isUserLoggedIn = !req.session.user;
    const view = isUserLoggedIn ? 'home/home' : 'home/login';
    const jsFile = isUserLoggedIn ? '/public/js/home.js' : '/public/js/login.js';

    return res.status(200).render(view, {
      title: "NatureScape",
      css: "public/css/home.css",
      js: jsFile,
    });

  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: "Something went wrong loading the page",
      error
    });
  }
});

router.get('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error logging out: ', err);
        return res.status(500).send('Internal Server Error');
      }
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
}); 

export default router;