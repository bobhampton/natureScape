// middleware.js
import * as userData from './data/users.js';
import validation from './data/helpers.js'
import xss from 'xss';

export const authorizeRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Must be logged in" }); // Or redirect
      }

      const user = await userData.getUserById(req.session.user._id);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' }); // Or redirect
      }
        
      if (user.role !== requiredRole && user.role !== "admin") { // Allow admin to do everything
        return res.status(403).json({ error: 'Forbidden' }); // Or redirect
      }
      next(); // User has the required role, proceed
    } catch (e) {
      console.error("Error in authorizeRole middleware:", e); // Important for debugging
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

export const ensureAuth = (req, res, next) => {
  if (req.session.user) {
      next();
  } else {
      req.session.redirectTo = req.originalUrl; // Save the original URL
      res.redirect('/login');
  }
};

// Check for xss attack
export const checkXss = (req, res, next) => {
  const sanitize = (input, varName) => {
    // Check for empty input
    try {
      input = validation.checkString(input, varName);
    } catch (err) {
      res.status(400).render('error', {
        css: '/public/css/error.css',
        title: '2Input Error',
        error: err
      });
      return null;
    }
    // Check for xss attack
    try {
      // Strip anything malicious
      input = xss(input, {
        whiteList: [], // empty, means filter out all tags
        stripIgnoreTag: true, // filter out all HTML not in the whitelist
        stripIgnoreTagBody: ['script']
      });

      // Check if input is empty after sanitizing
      input = input.trim()
      if (input.length === 0) {
        throw new Error('XSS attack detected. Nice try though!');
      }
      return input;
    } catch (err) {
      res.status(400).render('error', {
        css: '/public/css/error.css',
        title: 'Input Error',
        error: err
      });
      return null;
    }
  };

  for (const key in req.body) {
    req.body[key] = sanitize(req.body[key], key);
    if (req.body[key] === null) return; // Stop processing if an error occurs
  }

  for (const key in req.query) {
    req.query[key] = sanitize(req.query[key], key);
    if (req.query[key] === null) return; // Stop processing if an error occurs
  }

  for (const key in req.params) {
    req.params[key] = sanitize(req.params[key], key);
    if (req.params[key] === null) return; // Stop processing if an error occurs
  }

  next();
};
