import { Router } from 'express'
const router = Router();



router
  .route('/') //Renders the terms page
  .get(async (req, res) => {
    //code here for GET
    try {
        //Path to the template
      return res.render('users/terms', {
        css: '/public/css/terms.css'
      })
    } catch (e) {
      return res.status(400).json({ error: e })
    }
  });

export default router;