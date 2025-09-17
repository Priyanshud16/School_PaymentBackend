const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Not authorized, no authorization header' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, invalid authorization scheme' });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Allow a dev fallback token only when explicitly enabled
    if (
      process.env.ALLOW_FAKE_JWT === 'true' &&
      token === 'fake-jwt-token'
    ) {
      // Attach a mock user in dev to unblock frontend while real auth is wired
      const mockUser = await User.findOne() || { _id: '000000000000000000000000', role: 'admin' };
      req.user = mockUser;
      return next();
    }

    // Basic format check to avoid jwt malformed errors from obvious bad input
    if (token.split('.').length !== 3) {
      return res.status(401).json({ message: 'Not authorized, invalid token format' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || typeof secret !== 'string' || secret.length === 0) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server misconfiguration: JWT secret missing' });
    }

    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Not authorized, invalid token payload' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, token malformed' });
    }
    return res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = { protect };