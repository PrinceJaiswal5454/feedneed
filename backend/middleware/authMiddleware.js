/**
 * Authentication & Role-Based Access Control (RBAC) Middleware
 * Verifies JWT tokens and attaches the authenticated user to req.user.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes requiring authentication
const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in to access this resource.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user account belonging to this token no longer exists.',
      });
    }

    if (currentUser.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator due to policy violations.',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
};

// Optional authentication for public endpoints that conditionally reveal protected info
const optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).select('-password');
      if (currentUser && !currentUser.isSuspended) {
        req.user = currentUser;
      }
    }
  } catch (err) {
    // Ignore invalid tokens on public routes and treat viewer as guest
  }
  next();
};

// Restrict access to specific account roles ('individual', 'ngo', 'admin')
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorizeRoles };
