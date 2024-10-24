require("../models/database");
const Category = require("../models/category");

/*
 *GET /homePage
 *Home Page
 */

exports.homePage = async (req, res) => {
  try {
    const limit = 5;
    const categories = await Category.find({}).limit(limit);
    res.render("index", { title: "homepage", categories });
  } catch (error) {
    res.status(500).send({ message: error.message || "something went wrong" });
  }
};

