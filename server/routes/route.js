const express = require("express");
const router = express.Router();

const recipeController = require("../controller/recipeController.js");
router.get('/',recipeController.indexPage)
router.get('/sign-in',recipeController.signInPage)
router.get('/sign-up',recipeController.signUpPage)
router.get('/forgot-password',recipeController.forgotPasswordPage)
router.get('/reset-password',recipeController.resetPasswordPage)
router.get('/mail-confirmation',recipeController.mailConfirmationPage)
router.get('/404',recipeController.errorPage)

router.get('/recipe/:id',recipeController.exploreRecipe)
router.get('/categories',recipeController.exploreCategories)
router.get('/categories/:id',recipeController.exploreCategoriesById)
router.post('/search',recipeController.searchRecipe)
router.get('/explore-latest',recipeController.exploreLatest)
router.get('/explore-random',recipeController.exploreRandom)
router.route('/submit-recipe').get(recipeController.submitRecipePage).post(recipeController.submitRecipePost)
router.get('/about',recipeController.aboutPage)
router.get('/contact',recipeController.contactPage)

module.exports = router;
