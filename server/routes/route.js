const express = require("express");
const router = express.Router();

const recipeController = require("../controller/recipeController.js");
router.get('/',recipeController.homePage)
router.get('/recipe/:id',recipeController.exploreRecipe)
router.get('/categories',recipeController.exploreCategories)
router.get('/categories/:id',recipeController.exploreCategoriesById)
router.post('/search',recipeController.searchRecipe)
router.get('/explore-latest',recipeController.exploreLatest)
module.exports = router;
