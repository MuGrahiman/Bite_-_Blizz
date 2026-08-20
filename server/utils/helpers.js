/**
 * Utility Helpers
 */

const { COOKIE_NAMES } = require( "../config/constants" );
const { getMailCookieConfig } = require( "../config/mail" );

const titleFun = ( title ) => title && `Cooking Blog - ${ title }`;


const setMailCookie = ( res, data ) => {
    res.cookie( COOKIE_NAMES.MAIL_CONFIRM, JSON.stringify( data ), getMailCookieConfig() );
};

const clearMailCookie = ( res ) => {
    res.clearCookie( COOKIE_NAMES.MAIL_CONFIRM );
};

module.exports = {
    titleFun,
    setMailCookie,
    clearMailCookie
};