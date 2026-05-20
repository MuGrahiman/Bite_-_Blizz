const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

router.get("/categories", recipeController.exploreCategories);
router.get("/categories/:id", recipeController.exploreCategoriesById);
router.get("/recipe/:id", recipeController.exploreRecipe);
router.post("/search", recipeController.searchRecipe);
router.get("/explore-latest", recipeController.exploreLatest);
router.get("/explore-random", recipeController.exploreRandom);

module.exports = router;