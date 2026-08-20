/**
 * Mail Confirmation Controller
 * Reusable notification page for verification and password reset
 */

const catchAsync = require( "../utils/catchAsync" );
const {
    titleFun,
    setMailCookie,
    clearMailCookie,
} = require( "../utils/helpers" );
const User = require( "../models/User" );
const Token = require( "../models/Token" );
const authService = require( "../services/authService" );
const emailService = require( "../services/emailService" );

const {
    TOKEN_TYPES,
    COOKIE_NAMES,
    ERROR_MESSAGES
} = require( "../config/constants" );
const { BadRequestError } = require( "../utils/customErrors" );
const { getMailConfig } = require( "../config/mail" );

// GET /mail-confirmation (generic confirmation page)
// exports.mailConfirmationPage = catchAsync( async ( req, res ) => {
//   res.render( "mail-confirmation", {
//     title: titleFun( "Mail Confirmation" ),
//     message: req.flash( "infoSuccess" )[ 0 ] || "Please check your email.",
//   } );
// } );

// GET /mail-confirmation
exports.mailConfirmationPage = catchAsync( async ( req, res ) => {
    console.log( "Mail Confirmation Page accessed" );
    const cookieData = req.signedCookies[ COOKIE_NAMES.MAIL_CONFIRM ];

   return res.render( "mail-confirmation", {
        title: titleFun( 'reset' === TOKEN_TYPES.VERIFICATION ? "Verify Email" : "Password Reset" ),
       
    } );

    if ( !cookieData ) {
        return res.redirect( "/" );
    }

    let data;
    try {
        data = JSON.parse( cookieData );
    } catch {
        clearMailCookie( res );
        return res.redirect( "/" );
    }

    // const { type, userName, email } = data;
    const { type, userName, email } = { type: TOKEN_TYPES.VERIFICATION, userName: "Mujeeb", email: "mujeeb@example.com" };

    const config = getMailConfig( type );

    if ( !config ) {
        clearMailCookie( res );
        return res.redirect( "/" );
    }

    res.render( "mail-confirmation", {
        title: titleFun( type === TOKEN_TYPES.VERIFICATION ? "Verify Email" : "Password Reset" ),
        ...config,
        userName,
        async: true,
        mailId: email,
    } );
} );

// POST /mail-confirmation/resend
exports.resendMail = catchAsync( async ( req, res ) => {
    const cookieData = req.signedCookies[ COOKIE_NAMES.MAIL_CONFIRM ];

    if ( !cookieData ) {
        throw new BadRequestError( ERROR_MESSAGES.SESSION_EXPIRED );
    }

    let data;
    try {
        data = JSON.parse( cookieData );
    } catch {
        clearMailCookie( res );
        throw new BadRequestError( ERROR_MESSAGES.INVALID_SESSION );
    }

    const { tokenId, type } = data;

    // Verify token exists in database
    const tokenDoc = await Token.findById( tokenId );
    if ( !tokenDoc || tokenDoc.used || tokenDoc.expiresAt < new Date() ) {
        clearMailCookie( res );
        throw new BadRequestError( ERROR_MESSAGES.TOKEN_NOT_FOUND );
    }

    // Verify user exists
    const user = await User.findById( tokenDoc.userId );
    if ( !user ) {
        clearMailCookie( res );
        throw new BadRequestError( ERROR_MESSAGES.USER_NOT_FOUND );
    }

    // Invalidate old tokens of same type
    await Token.deleteMany( { userId: user._id, type } );

    // Generate new token
    const plainToken = authService.generateRandomToken();
    const newTokenDoc = await authService.saveToken(
        user._id,
        plainToken,
        type,
        getMailConfig( type ).tokenExpiryHours
    );

    // Send email
    if ( type === TOKEN_TYPES.VERIFICATION ) {
        await emailService.sendVerificationEmail( user.email, user.name, plainToken );
    } else {
        await emailService.sendPasswordResetEmail( user.email, user.name, plainToken );
    }

    // Refresh cookie with new token ID
    setMailCookie( res, {
        type,
        userName: user.name,
        email: user.email,
        tokenId: newTokenDoc._id,
    } );

    req.flash(
        "infoSuccess",
        `New ${ type === TOKEN_TYPES.VERIFICATION ? "verification" : "reset" } email sent!`
    );
    res.redirect( "/mail-confirmation" );
} );