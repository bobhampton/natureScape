// middleware.js
import * as userData from './data/users.js';

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
