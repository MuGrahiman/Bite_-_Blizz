const env = require( "../config/env" );
const { MAIL_COOKIE_MAX_AGE, MAIL_CONFIGS, COOKIE_NAMES } = require( "../config/constants" );

/**
 * Mail Configuration
 * Cookie settings and mail content retrieval
 */

const getMailCookieConfig = () => ( {
    signed: true,
    httpOnly: true,
    maxAge: MAIL_COOKIE_MAX_AGE,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
} );

const getMailConfig = ( type ) => MAIL_CONFIGS[ type ] || null;


module.exports = {
    getMailCookieConfig,
    getMailConfig,
};