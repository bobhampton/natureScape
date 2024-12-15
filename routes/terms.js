import { Router } from 'express'
const router = Router();



router
  .route('/') //Renders the terms page
  .get(async (req, res) => {
    //code here for GET
    try {
        //Path to the template
      return res.render('users/terms', {
        title: "Terms & Agreements",
        css: '/public/css/terms.css',
        js: '/public/js/image_edit.js'
      })
    } catch (e) {
      return res.status(400).json({ error: e })
    }
  });

export default router;