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

/**
 * Dummy Data Example
 */

// async function insertDummyData() {
//   try {
//     await Recipe.insertMany();
//   } catch (error) {
//     console.log("🚀 ~ insertDummyData ~ error:", error);
//   }
// }

// insertDummyData();
