require("../models/database");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const titleFun = (title) => title && "Cooking Blog-" + title;
/*
 *GET /
 *Home Page
 */

exports.homePage = async (req, res) => {
  try {
    const limit = 5;
    const categories = await Category.find({}).limit(limit);
    const recipes = await Recipe.find({}).sort({ _id: -1 }).limit(limit);
    res.render("index", { title: titleFun("Home"), categories, recipes });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *GET /categories
 *Categories
 */

exports.exploreCategories = async (req, res) => {
  try {
    const limit = 20;
    const categories = await Category.find({}).limit(limit);
    res.render("categories", { title: titleFun("Categories"), categories });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *GET /categories/:id
 *Category
 */

exports.exploreCategoriesById = async (req, res) => {
  try {
    const category = req.params.id;
    const categoryById = await Recipe.find({ category: category });
    res.render("category", {
      title: titleFun(category + "-Category"),
      category,
      categoryById,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *GET /recipe/:id
 *Recipe
 */

exports.exploreRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId);
    res.render("recipe", { title: titleFun(recipe.name + "-Recipe"), recipe });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *POST /search
 *Search
 */

exports.searchRecipe = async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm;
    const recipes = await Recipe.find({
      $text: { $search: searchTerm, $diacriticSensitive: true },
    });
    res.render("search", { title: titleFun("Search"), recipes });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *GET /explore-latest
 *Explore Latest
 */

exports.exploreLatest = async (req, res) => {
  try {
    const limit = 20;
    const recipes = await Recipe.find({}).sort({ _id: -1 }).limit(limit);
    res.render("explore-latest", {
      title: titleFun("Explore Latest"),
      recipes,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *GET /explore-random
 *Explore Random
 */

exports.exploreRandom = async (req, res) => {
  try {
    const count = await Recipe.find({}).countDocuments();
    const random = Math.floor(Math.random() * count);

    const recipe = await Recipe.findOne().skip(random).exec();
    res.render("explore-random", {
      title: titleFun("Explore Random"),
      recipe,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *GET /submit-recipe
 *Submit Recipe
 */

exports.submitRecipePage = async (req, res) => {
  try {
    const infoErrorObj = req.flash("infoErrors");
    const infoSuccessObj = req.flash("infoSuccess");
    console.log(infoErrorObj);
    res.render("submit-recipe", {
      title: titleFun("Submit Recipe"),
      infoErrorObj,
      infoSuccessObj,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *POST /submit-recipe
 *Submit Recipe
 */

exports.submitRecipePost = async (req, res) => {
  try {
    const { name, email, description, ingredients, category } = req.body;
    const files = req.files;

    switch (true) {
      case !name:
        throw new Error("Field 'name' is required");
      case !email:
        throw new Error("Field 'email' is required");
      case !description:
        throw new Error("Field 'description' is required");
      case !ingredients[0]:
        throw new Error("Field 'ingredients' is required");
      case !category:
        throw new Error("Field 'category' is required");
      case !files || !files.image || Object.keys(files).length === 0:
        throw new Error("No files were uploaded.");
    }

    let newImageName = Date.now() + files.image.name;
    const uploadPath =
      require("path").resolve("./") + "/public/uploads/" + newImageName;
    await files.image.mv(uploadPath, (err) => err && res.status(500).send(err));

    const newRecipe = new Recipe({
      name: name,
      email: email,
      image: newImageName,
      category: category,
      description: description,
      ingredients: ingredients,
    });

    await newRecipe.save();

    req.flash("infoSuccess", "Recipe has been added.");
    res.redirect("/submit-recipe");
  } catch (error) {
    req.flash("infoErrors", error.message);
    res.redirect("/submit-recipe");
  }
};
