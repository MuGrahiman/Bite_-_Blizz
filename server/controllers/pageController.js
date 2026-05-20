/**
 * Page Controller
 * Static pages that don't touch the database
 */

const catchAsync = require("../utils/catchAsync");
const { titleFun } = require("../utils/helpers");

exports.indexPage = catchAsync(async (req, res) => {
  res.render("index", { title: titleFun("Home") });
});

exports.aboutPage = catchAsync(async (req, res) => {
  res.render("about", { title: titleFun("About") });
});

exports.contactPage = catchAsync(async (req, res) => {
  res.render("contact", { title: titleFun("Contact") });
});

exports.errorPage = catchAsync(async (req, res) => {
  res.status(404).render("404", { title: titleFun("404") });
});