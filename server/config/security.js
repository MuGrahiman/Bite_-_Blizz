/**
 * Security Middleware Configuration
 * Helmet, rate limiting, mongo sanitization, CORS
 */

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
// const cors = require("cors");

// Rate limiter: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts. Please try again after 15 minutes.",
  skipSuccessfulRequests: true, // Don't count successful logins
});

// CORS configuration — restrict to your domains in production
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [""] // Replace with your actual domain
      : ["http://localhost:3000"],
  credentials: true, // Allow cookies/session across domains
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const securityMiddleware = [
  helmet(), // Security headers (XSS, clickjacking, etc.)
//   cors(corsOptions),
  limiter,
  mongoSanitize(), // Prevent NoSQL injection ($gt, $ne operators)
];

module.exports = { securityMiddleware, authLimiter };