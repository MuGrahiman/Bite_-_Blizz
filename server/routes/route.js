const express = require("express");
const router = express.Router();

const recipeController = require("../controller/recipeController.js");
router.get('/',recipeController.homePage)
router.get('/categories',recipeController.exploreCategories)
router.get('/recipe/:id',recipeController.exploreRecipe)
module.exports = router;
