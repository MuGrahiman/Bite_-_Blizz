require("../models/database");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const titleFun = (title) => title && "Cooking Blog-" + title;
/*
 *GET /
 *Home
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
      title: titleFun(category+"-Category"),
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
    res.render("recipe", { title: titleFun(recipe.name+"-Recipe"), recipe });
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
