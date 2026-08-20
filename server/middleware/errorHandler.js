/**
 * Centralized Error Handling
 * Converts all errors to CustomError instances, handles Cloudinary-specific errors
 */

const mongoose = require( "mongoose" );
const {
  CustomError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
  BadRequestError,
  ConflictError,
} = require( "../utils/customErrors" );
const { logger } = require( "./logger" );

// Convert Mongoose errors
const handleMongooseError = ( err ) => {
  if ( err instanceof mongoose.Error.ValidationError ) {
    const messages = Object.values( err.errors ).map( ( e ) => e.message );
    return new ValidationError( `Invalid input: ${ messages.join( ". " ) }` );
  }

  if ( err instanceof mongoose.Error.CastError ) {
    return new BadRequestError( `Invalid ${ err.path }: ${ err.value }` );
  }

  if ( err.code === 11000 ) {
    const field = Object.keys( err.keyValue )[ 0 ];
    return new ConflictError( `${ field } already exists` );
  }

  return new InternalServerError( "Database operation failed" );
};

// Convert JWT errors
const handleJWTError = ( err ) => {
  if ( err.name === "TokenExpiredError" ) {
    return new UnauthorizedError( "Token expired. Please log in again." );
  }
  if ( err.name === "JsonWebTokenError" ) {
    return new UnauthorizedError( "Invalid token. Please log in again." );
  }
  return err;
};

// Convert Cloudinary errors
const handleCloudinaryError = ( err ) => {
  // Cloudinary SDK errors have .http_code property
  if ( err.http_code ) {
    switch ( err.http_code ) {
      case 400:
        return new BadRequestError( `Image upload failed: ${ err.message }` );
      case 401:
        return new UnauthorizedError( "Cloudinary authentication failed. Check your API credentials." );
      case 404:
        return new NotFoundError( "Cloudinary resource not found." );
      case 408:
        return new TimeoutError( "Image upload timed out. Please try again." );
      case 420:
        return new BadRequestError( "Rate limit exceeded on image uploads. Please wait." );
      case 500:
      case 502:
      case 503:
      case 504:
        return new InternalServerError( "Image service temporarily unavailable. Please try again later." );
      default:
        return new InternalServerError( `Image upload failed: ${ err.message }` );
    }
  }

  // Multer-Cloudinary storage errors
  if ( err.message && err.message.includes( "Cloudinary" ) ) {
    return new InternalServerError( "Image processing failed. Please try again." );
  }

  return err;
};

// Development: full details
const sendErrorDev = ( err, res ) => {
  res.status( err.statusCode ).json( {
    success: false,
    status: err.statusCode,
    message: err.message,
    error: err,
    stack: err.stack,
  } );
};

// Production: sanitize
const sendErrorProd = ( err, res ) => {
  if ( err.isOperational ) {
    res.status( err.statusCode ).json( {
      success: false,
      status: err.statusCode,
      message: err.message,
    } );
  } else {
    logger.error( "ERROR :%s", err );
    res.status( 500 ).json( {
      success: false,
      status: 500,
      message: "Something went wrong",
    } );
  }
};

// Global error handler
const globalErrorHandler = ( err, req, res, next ) => {
  let error = err;

  if ( !( error instanceof CustomError ) ) {
    if ( err instanceof mongoose.Error ) {
      error = handleMongooseError( err );
    } else if ( err.name === "TokenExpiredError" || err.name === "JsonWebTokenError" ) {
      error = handleJWTError( err );
    } else if ( err.http_code || ( err.message && err.message.includes( "Cloudinary" ) ) ) {
      error = handleCloudinaryError( err );
    } else {
      error = new InternalServerError( err.message );
      error.isOperational = false;
    }
  }

  if ( process.env.NODE_ENV === "development" ) {
    logger.error( "Error occurred: ", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500,
      name: error.name,
    } );
    sendErrorDev( error, res );
  } else {
    sendErrorProd( error, res );
  }
};

// 404 handler
const notFoundHandler = ( req, res, next ) => {
  next( new NotFoundError( `Cannot find ${ req.originalUrl } on this server` ) );
};

module.exports = { globalErrorHandler, notFoundHandler };