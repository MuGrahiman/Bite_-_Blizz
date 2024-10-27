require("../models/database");
const Category = require("../models/category");
const TITLE = 'Cooking Blog'
/*
 *GET /homePage
 *Home Page
 */

exports.homePage = async (req, res) => {
  try {
    const limit = 5;
    const categories = await Category.find({}).limit(limit);
    res.render("index", { title: TITLE+"-HomePage", categories });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

/*
 *GET /exploreCategories
 *Categories
 */

exports.exploreCategories = async (req, res) => {
  try {
    const limit = 20;
    const categories = await Category.find({}).limit(limit);
    res.render("categories", { title: TITLE+"-Categories", categories });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};
