/**
 * Recipe Controller
 * Recipe browsing operations (read-only)
 */

const catchAsync = require("../utils/catchAsync");
const { titleFun } = require("../utils/helpers");
const recipeService = require("../services/recipeService");
const categoryService = require("../services/categoryService");
const { NotFoundError } = require( "../utils/customErrors" );

exports.exploreCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getCategories(20);
  res.render("categories", { title: titleFun("Categories"), categories });
});

exports.exploreCategoriesById = catchAsync(async (req, res) => {
  const category = req.params.id;
  const categoryById = await recipeService.getRecipesByCategory(category);
  res.render("category", {
    title: titleFun(`${category} - Category`),
    category,
    categoryById,
  });
});

exports.exploreRecipe = catchAsync(async (req, res) => {
  const recipe = await recipeService.getRecipeById(req.params.id);
  
  if (!recipe) {
    throw new NotFoundError("Recipe not found");
  }
  
  res.render("recipe", {
    title: titleFun(`${recipe.name} - Recipe`),
    recipe,
  });
});

exports.searchRecipe = catchAsync(async (req, res) => {
  const searchTerm = req.body.searchTerm;
  const recipes = await recipeService.searchRecipes(searchTerm);
  res.render("search", { title: titleFun("Search"), recipes });
});

exports.exploreLatest = catchAsync(async (req, res) => {
  const recipes = await recipeService.getLatestRecipes(20);
  res.render("explore-latest", {
    title: titleFun("Explore Latest"),
    recipes,
  });
});

exports.exploreRandom = catchAsync(async (req, res) => {
  const recipe = await recipeService.getRandomRecipe();
  res.render("explore-random", {
    title: titleFun("Explore Random"),
    recipe,
  });
});