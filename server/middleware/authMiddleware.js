import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Secret key for JWT – must be defined in .env as JWT_SECRET
export const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

/**
 * Generate a JWT token for a given user ID.
 * @param {string|ObjectId} userId - The ID of the user to embed in the payload.
 * @returns {string} Signed JWT token.
 */
export const generateToken = (userId) => {
  const payload = { id: userId };
  // Token expires in 7 days for stable session persistence
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Middleware to protect routes – verifies JWT, loads user, and checks block status.
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    if (user.isBlocked || user.status === 'blocked' || user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact the administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

/**
 * Optional protect: verifies JWT if present and attaches user info, but does not block unauthenticated requests.
 */
export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isBlocked && user.status !== 'blocked') {
        req.user = user;
      }
    } catch (error) {
      // Invalid/expired token — proceed as unauthenticated guest
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

/**
 * Admin only: requires authenticated user to have admin role in database.
 */
export const adminOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized, login required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
