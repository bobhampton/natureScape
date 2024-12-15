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
      if (input.length > 1000) {
        throw 'Input too long';
      }
    } catch (err) {
      res.status(400).render('error', {
        css: '/public/css/error.css',
        js: '/public/js/image_edit.js',
        title: 'Input Error',
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

      let responseArr = [
        'XSS attack detected. Nice try though!',
        'XSS attack detected. Close, but no cigar!',
        'XSS attack detected. Better luck next time!',
        'XSS attack detected. You almost got me!',
        'XSS attack detected. You are so close! Keep trying bud!',
        'XSS attack detected. Super close! Keep trying!',
        'XSS attack detected. You are doing something very naughty, does your mother know???',
        'XSS attack detected. You are no hacker hahahahahaha',
        'XSS attack detected. You think you can hack me?',
        'XSS attack detected. YOU!!! Shall not HACK!',
      ]

      const randomResponse = responseArr[Math.floor(Math.random() * responseArr.length)];

      // Check if input is empty after sanitizing
      input = input.trim()
      if (input.length === 0) {
        throw new Error(randomResponse);
      }
      return input;
    } catch (err) {
      res.status(400).render('error', {
        css: '/public/css/error.css',
        js: '/public/js/image_edit.js',
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
