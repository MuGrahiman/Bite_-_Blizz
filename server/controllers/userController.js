/**
 * User Controller
 * User actions: recipe submission, dashboard, profile
 */

const catchAsync = require("../utils/catchAsync");
const { titleFun } = require("../utils/helpers");
const recipeService = require("../services/recipeService");
const { BadRequestError } = require( "../utils/customErrors" );

exports.submitRecipePage = catchAsync(async (req, res) => {
  const infoErrorObj = req.flash("infoErrors");
  const infoSuccessObj = req.flash("infoSuccess");
  
  res.render("submit-recipe", {
    title: titleFun("Submit Recipe"),
    infoErrorObj,
    infoSuccessObj,
  });
});

exports.submitRecipePost = catchAsync(async (req, res) => {
  const { name, email, description, ingredients, category } = req.body;
  
  // Validation
  if (!name) throw new BadRequestError("Field 'name' is required");
  if (!email) throw new BadRequestError("Field 'email' is required");
  if (!description) throw new BadRequestError("Field 'description' is required");
  if (!ingredients || (Array.isArray(ingredients) && !ingredients[0])) {
    throw new BadRequestError("Field 'ingredients' is required");
  }
  if (!category) throw new BadRequestError("Field 'category' is required");
  
  // Image handled by multer middleware — req.file set by upload.single('image')
  if (!req.file) {
    throw new BadRequestError("Recipe image is required");
  }

  const newRecipe = await recipeService.createRecipe({
    name,
    email,
    image: req.file.path, // Cloudinary URL from multer-storage-cloudinary
    category,
    description,
    ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
  });

  req.flash("infoSuccess", "Recipe has been added.");
  res.redirect("/submit-recipe");
});