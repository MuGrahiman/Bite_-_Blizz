/**
 * Cooking Blog — Main Application Entry Point
 * Security-first, modular, production-ready foundation
 */

require("dotenv").config();

const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");
const path = require("path");
const session = require("express-session");
const MongoStore = require('connect-mongo').default; 
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// Configuration imports
const connectDB = require("./server/config/db");
const { securityMiddleware, authLimiter } = require("./server/config/security");
const { requestLogger } = require("./server/middleware/logger");
const { globalErrorHandler, notFoundHandler } = require("./server/middleware/errorHandler");
const { handleUploadError } = require("./server/middleware/upload");

// Route imports
//TODO: const routes = require("./server/routes/route.js");
const routes = require("./server/routes/index");

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Validate critical environment variables
if (!process.env.SESSION_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
  console.error("FATAL: Missing required environment variables. Check .env file.");
  process.exit(1);
}

// Connect to database
connectDB();

// Security middleware (must be first) — imported from config/security.js
app.use(securityMiddleware);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser with secret from env
app.use(cookieParser(process.env.SESSION_SECRET));
// Session configuration with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "sessionId",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "strict",
    },
  })
);

// Flash messages
app.use(flash());

// Static files
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

// View engine configuration
app.use(expressEjsLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "./layouts/main");

// Flash and user locals
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  next();
});

// Mount routes
app.use("/", routes);

// Handle upload errors
app.use(handleUploadError);

// 404 handler — must be after all routes
app.use(notFoundHandler);

// Global error handler — must be last
app.use(globalErrorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} on port ${port}`);
});

// Unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥", err.name, err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => console.log("Process terminated"));
});

module.exports = app;