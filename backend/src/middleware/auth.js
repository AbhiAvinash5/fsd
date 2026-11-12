import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'accessaudit-secret-key-production-ready-2026';

/**
 * Authentication Middleware:
 * Verifies JWT token from Authorization header (Bearer <token>)
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No bearer token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication session. Please log in again.'
      });
    }

    // Support demo/guest token
    if (decoded.isGuest) {
      req.user = {
        _id: decoded.userId || 'guest-user-id',
        name: 'Demo Evaluator',
        email: 'demo@accessaudit.io',
        role: 'user'
      };
      return next();
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    res.status(500).json({ success: false, message: 'Server authentication error.' });
  }
}

