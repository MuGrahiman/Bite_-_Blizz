const express = require( "express" );
const router = express.Router();
const authController = require( "../controllers/authController" );
const validate = require( "../middleware/validate" );
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require( "../validators/authValidator" );
const mailConfirmationController = require( "../controllers/mailConfirmationController" );

// Page renders
router.get( "/sign-up", authController.signUpPage );
router.get( "/mail-confirmation", mailConfirmationController.mailConfirmationPage );
router.get( "/verify-email", authController.verifyEmail );
router.get( "/sign-in", authController.signInPage );
router.get( "/forgot-password", authController.forgotPasswordPage );
router.get( "/reset-password", authController.resetPasswordPage );

// Actions
router.post( "/sign-up", validate( registerSchema ), authController.register );
router.post( "/mail-confirmation", mailConfirmationController.resendMail );
router.post( "/sign-in", validate( loginSchema ), authController.login );
router.post( "/logout", authController.logout );
router.post( "/forgot-password", validate( forgotPasswordSchema ), authController.forgotPassword );
router.post( "/reset-password", validate( resetPasswordSchema ), authController.resetPassword );

module.exports = router;