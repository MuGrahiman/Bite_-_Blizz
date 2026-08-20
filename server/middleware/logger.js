/**
 * Request Logging Configuration
 * Uses Morgan for HTTP logging, Winston for persistent structured logs
 */

const morgan = require( "morgan" );
const winston = require( "winston" );

// Winston logger configuration
const logger = winston.createLogger( {
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp( { format: "YYYY-MM-DD HH:mm:ss" } ),
    winston.format.errors( { stack: true } ),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "cooking-blog" },
  transports: [
    // Write all logs to console
    new winston.transports.Console( {
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ( { level, message, timestamp, stack, statusCode, name, ...metadata } ) => {
            let msg = `${ timestamp } [${ level }]: ${ statusCode ? statusCode : '' }\n${ name ? name + ': ' : '' }${ message }\n${ stack ? stack : '' }`;

            if ( Object.keys( metadata ).length > 0 ) {
              msg += `${ JSON.stringify( metadata ) }`;
            }

            return msg;
          }
        )

      ),
    } ),
    // Write errors to file
    new winston.transports.File( {
      filename: "server/logs/error.log",
      level: "error",
    } ),
    // Write all logs to file
    new winston.transports.File( { filename: "server/logs/combined.log" } ),
  ],
} );

// Morgan HTTP request logger — streams into Winston
const stream = {
  write: ( message, status ) => logger.info( message.trim(), { status } ),
};

// Skip logging in test environment
const skip = () => process.env.NODE_ENV === "test";

// Morgan middleware factory
const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

module.exports = { logger, requestLogger };