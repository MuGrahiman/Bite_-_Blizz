/**
 * Auth Middleware
 * Verify JWT from cookie, attach user to request
 */

const authService = require("../services/authService");
const User = require("../models/User");
const { UnauthorizedError } = require("../utils/customError");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new UnauthorizedError("Please log in to access this page");
    }

    const decoded = authService.verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    req.user = user;
    res.locals.user = user; // Available in all views
    next();
  } catch (err) {
    res.clearCookie("jwt");
    next(err);
  }
};

// Optional: attach user if logged in, don't require
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (token) {
      const decoded = authService.verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, optionalAuth };