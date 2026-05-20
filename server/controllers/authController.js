/**
 * Auth Controller
 * Auth page renders only — no backend logic yet
 */

const catchAsync = require("../utils/catchAsync");
const { titleFun } = require("../utils/helpers");

exports.signInPage = catchAsync(async (req, res) => {
  res.render("sign-in", { title: titleFun("Sign In") });
});

exports.signUpPage = catchAsync(async (req, res) => {
  res.render("sign-up", { title: titleFun("Sign Up") });
});

exports.forgotPasswordPage = catchAsync(async (req, res) => {
  res.render("forgot-password", { title: titleFun("Forgot Password") });
});

exports.resetPasswordPage = catchAsync(async (req, res) => {
  res.render("reset-password", { title: titleFun("Reset Password") });
});

exports.mailConfirmationPage = catchAsync(async (req, res) => {
  res.render("mail-confirmation", { title: titleFun("Mail Confirmation") });
});