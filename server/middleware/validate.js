/**
 * Validation Middleware
 * Runs Joi schema against req.body
 */

const { BadRequestError } = require( "../utils/customErrors" );

const validate = ( schema ) => {
  return ( req, res, next ) => {
    const { error } = schema.validate( req.body, { abortEarly: false } );
    if ( error ) {

      const errors = error.details.map( ( detail ) => ( {
        field: detail.path[ 0 ],
        message: detail.message,
      } ) );

      const validationErrors = error.details.reduce(
        ( validationError, detail ) => {
          const field = detail.path[ 0 ];

          if ( !validationError[ field ] )
            validationError[ field ] = detail.message;


          return validationError;
        },
        {},
      );

      // For SSR: attach errors to flash or locals, then redirect
      if ( req.headers[ "content-type" ]?.includes( "application/json" ) ) {
        return next( new BadRequestError( "Validation failed", validationErrors ) );
      }
      // For form submissions: flash errors and redirect back
      req.flash( "validationErrors", validationErrors );
      req.flash( "formData", req.body );
      return res.redirect( req.originalUrl );
    }

    next();
  };
};

module.exports = validate;
