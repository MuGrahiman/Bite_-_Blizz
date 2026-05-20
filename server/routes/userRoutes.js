const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { upload } = require("../middleware/upload");

router
  .route("/submit-recipe")
  .get(userController.submitRecipePage)
  .post(upload.single("image"), userController.submitRecipePost);

module.exports = router;