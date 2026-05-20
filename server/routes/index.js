/**
 * Route Aggregator
 * Combines all route modules
 */

const express = require("express");
const router = express.Router();

const pageRoutes = require("./pageRoutes");
const authRoutes = require("./authRoutes");
const recipeRoutes = require("./recipeRoutes");
const userRoutes = require("./userRoutes");

router.use("/", pageRoutes);
router.use("/", authRoutes);
router.use("/", recipeRoutes);
router.use("/", userRoutes);

module.exports = router;