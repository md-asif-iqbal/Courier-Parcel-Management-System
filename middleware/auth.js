// backend/middleware/auth.js

import jwt from 'jsonwebtoken';
import User from '../models/user.js';

/**
 * Authenticate incoming requests by verifying a JWT.
 * Accepts both raw tokens and "Bearer <token>" headers.
 */
export const authenticate = async (req, res, next) => {
  // Log the incoming header for debug
//   console.log('Incoming Authorization header:', req.headers.authorization);

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Unauthorized — no token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user document to req.user
    req.user = await User.findById(payload.id);
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Authorize users based on their role.
 * Usage: authorize('admin', 'agent')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden — insufficient rights' });
    }
    next();
  };
};
