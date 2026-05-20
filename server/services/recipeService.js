/**
 * Recipe Service
 * Business logic for recipe operations
 */

const Recipe = require("../models/Recipe");

const getLatestRecipes = async (limit = 20) => {
  return await Recipe.find({}).sort({ _id: -1 }).limit(limit).lean();
};

const getRecipesByCategory = async (category) => {
  return await Recipe.find({ category }).lean();
};

const getRecipeById = async (id) => {
  return await Recipe.findById(id).lean();
};

const getRandomRecipe = async () => {
  const count = await Recipe.countDocuments();
  const random = Math.floor(Math.random() * count);
  return await Recipe.findOne().skip(random).lean();
};

const searchRecipes = async (searchTerm) => {
  return await Recipe.find({
    $text: { $search: searchTerm, $diacriticSensitive: true },
  }).lean();
};

const createRecipe = async (recipeData) => {
  const recipe = new Recipe(recipeData);
  return await recipe.save();
};

const countRecipes = async () => {
  return await Recipe.countDocuments();
};

module.exports = {
  getLatestRecipes,
  getRecipesByCategory,
  getRecipeById,
  getRandomRecipe,
  searchRecipes,
  createRecipe,
  countRecipes,
};