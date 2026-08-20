/**
 * Auth Controller
 * All authentication actions: register, login, logout, verify, forgot, reset
 */

const catchAsync = require( "../utils/catchAsync" );
const { titleFun, setMailCookie } = require( "../utils/helpers" );
const User = require( "../models/User" );
const authService = require( "../services/authService" );
const emailService = require( "../services/emailService" );
const {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} = require( "../utils/customErrors" );
const env = require( "../config/env" );
const { TOKEN_TYPES } = require( "../config/constants" );

// GET /sign-up
exports.signUpPage = catchAsync( async ( req, res ) => {
  res.render( "sign-up", {
    title: titleFun( "Sign Up" ),
    errors: req.flash( "validationErrors" ),
    formData: req.flash( "formData" )[ 0 ] || {},
  } );
} );

// POST /sign-up
exports.register = catchAsync( async ( req, res ) => {
  const { name, email, password } = req.body;
  // Check existing user
  const existingUser = await User.findOne( { email } );
  if ( existingUser ) {
    throw new ConflictError( "Email already registered" );
  }

  // Hash password and create user
  const hashedPassword = await authService.hashPassword( password );
  const user = await User.create( {
    name,
    email,
    password: hashedPassword,
  } );

  // Generate verification token
  const plainToken = authService.generateRandomToken();
  const tokenDoc = await authService.saveToken(
    user._id,
    plainToken,
    TOKEN_TYPES.VERIFICATION,
    24 );

  // Send verification email
  await emailService.sendVerificationEmail( email, name, plainToken );

  // req.flash( "infoSuccess", "Registration successful! Please check your email to verify your account." );
  // res.redirect( "/sign-in" );

  setMailCookie( res, {
    type: TOKEN_TYPES.VERIFICATION,
    userName: name,
    email,
    tokenId: tokenDoc._id,
  } );

  res.redirect( "/mail-confirmation" );
} );

// GET /verify-email
exports.verifyEmail = catchAsync( async ( req, res ) => {
  const { token } = req.query;

  if ( !token ) {
    throw new BadRequestError( "Verification token is required" );
  }

  // Find and validate token
  const tokenDoc = await authService.findValidToken( token, "verification" );
  const user = tokenDoc.userId;

  // Update user
  user.isVerified = true;
  await user.save();

  // Mark token used
  await authService.markTokenUsed( tokenDoc._id );

  // Generate JWT and set cookie
  const jwtToken = authService.generateToken( user._id );
  res.cookie( "jwt", jwtToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: "strict",
  } );

  req.flash( "infoSuccess", "Email verified successfully! Welcome to Cooking Blog." );
  res.redirect( "/" );
} );


// GET /sign-in
exports.signInPage = catchAsync( async ( req, res ) => {
  res.render( "sign-in", {
    title: titleFun( "Sign In" ),
    errors: req.flash( "validationErrors" ),
    formData: req.flash( "formData" )[ 0 ] || {},
  } );
} );

// POST /sign-in
exports.login = catchAsync( async ( req, res ) => {
  const { email, password, rememberMe } = req.body;

  // Find user with password
  const user = await User.findOne( { email } ).select( "+password" );
  if ( !user ) {
    throw new UnauthorizedError( "Invalid email or password" );
  }

  // Check verified
  if ( !user.isVerified ) {
    // Resend verification email
    const plainToken = authService.generateRandomToken();
    await authService.saveToken( user._id, plainToken, "verification", 24 );
    await emailService.sendVerificationEmail( email, user.name, plainToken );

    throw new UnauthorizedError( "Please verify your email. A new verification link has been sent." );
  }

  // Verify password
  const isValid = await authService.verifyPassword( password, user.password );
  if ( !isValid ) {
    throw new UnauthorizedError( "Invalid email or password" );
  }

  // Generate JWT
  const jwtToken = authService.generateToken( user._id );

  // Set cookie with optional remember me
  const maxAge = rememberMe
    ? 1000 * 60 * 60 * 24 * 30 // 30 days
    : undefined; // Session cookie (browser close)

  res.cookie( "jwt", jwtToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    maxAge,
    sameSite: "strict",
  } );

  req.flash( "infoSuccess", `Welcome back, ${ user.name }!` );
  res.redirect( "/" );
} );

// GET /forgot-password
exports.forgotPasswordPage = catchAsync( async ( req, res ) => {
  res.render( "forgot-password", {
    title: titleFun( "Forgot Password" ),
    errors: req.flash( "validationErrors" ),
  } );
} );

// POST /forgot-password
exports.forgotPassword = catchAsync( async ( req, res ) => {
  const { email } = req.body;

  const user = await User.findOne( { email } );
  // Don't reveal if email exists (security)
  if ( !user ) {
    req.flash( "infoSuccess", "If an account exists, a reset link has been sent." );
    return res.redirect( "/forgot-password" );
  }

  // Invalidate old reset tokens
  await Token.deleteMany( { userId: user._id, type: "reset" } );

  // Generate new reset token
  const plainToken = authService.generateRandomToken();
  await authService.saveToken( user._id, plainToken, "reset", 1 ); // 1 hour

  // Send email
  await emailService.sendPasswordResetEmail( email, user.name, plainToken );

  req.flash( "infoSuccess", "If an account exists, a reset link has been sent." );
  res.redirect( "/forgot-password" );
} );

// GET /reset-password
exports.resetPasswordPage = catchAsync( async ( req, res ) => {
  const { token, email } = req.query;

  res.render( "reset-password", {
    title: titleFun( "Reset Password" ),
    token,
    email,
    errors: req.flash( "validationErrors" ),
  } );
} );

// POST /reset-password
exports.resetPassword = catchAsync( async ( req, res ) => {
  const { token, email, password } = req.body;

  // Find and validate token
  const tokenDoc = await authService.findValidToken( token, "reset" );
  const user = tokenDoc.userId;

  // Verify email matches
  if ( user.email !== email.toLowerCase() ) {
    throw new BadRequestError( "Invalid reset request" );
  }

  // Hash new password
  const hashedPassword = await authService.hashPassword( password );
  user.password = hashedPassword;
  await user.save();

  // Mark token used
  await authService.markTokenUsed( tokenDoc._id );

  // Clear all verification/reset tokens for this user (security)
  await Token.deleteMany( { userId: user._id, type: { $in: [ "verification", "reset" ] } } );

  req.flash( "infoSuccess", "Password reset successful! Please log in." );
  res.redirect( "/sign-in" );
} );


// POST /logout
exports.logout = catchAsync( async ( req, res ) => {
  res.cookie( "jwt", "", {
    httpOnly: true,
    expires: new Date( 0 ),
  } );
  req.flash( "infoSuccess", "You have been logged out." );
  res.redirect( "/" );
} );

