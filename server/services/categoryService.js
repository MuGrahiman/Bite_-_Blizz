/**
 * Category Service
 * Business logic for category operations
 */

const Category = require("../models/Category");

const getCategories = async (limit = 20) => {
  return await Category.find({}).limit(limit).lean();
};

module.exports = { getCategories };