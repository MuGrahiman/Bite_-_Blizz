/**
 * Environment Configuration
 * Centralized env vars with validation
 */

require( "dotenv" ).config();

const required = [
  "PORT",
  "MONGODB_URI",
  "SESSION_SECRET",
  "JWT_SECRET",
  "MAILER_MAIL",
  "MAILER_TOKEN",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = required.filter( ( key ) => !process.env[ key ] );

if ( missing.length > 0 ) {
  console.error( `FATAL: Missing env variables: ${ missing.join( ", " ) }` );
  process.exit( 1 );
}

module.exports = {
  port: parseInt( process.env.PORT, 10 ) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI,
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // Mailer
  mailerMail: process.env.MAILER_MAIL,
  mailerToken: process.env.MAILER_TOKEN,

  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

  // Base URL for emails
  baseUrl:
    process.env.NODE_ENV === "production"
      ? process.env.BASE_URL : `http://localhost:${ process.env.PORT || 3000 }`,
};