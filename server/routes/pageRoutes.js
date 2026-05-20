const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");

router.get("/", pageController.indexPage);
router.get("/about", pageController.aboutPage);
router.get("/contact", pageController.contactPage);
router.get("/404", pageController.errorPage);

module.exports = router;