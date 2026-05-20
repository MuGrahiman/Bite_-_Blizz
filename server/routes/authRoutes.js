const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/sign-in", authController.signInPage);
router.get("/sign-up", authController.signUpPage);
router.get("/forgot-password", authController.forgotPasswordPage);
router.get("/reset-password", authController.resetPasswordPage);
router.get("/mail-confirmation", authController.mailConfirmationPage);

module.exports = router;