module.exports = ( req, res, next ) => {
    res.locals.success_msg = req.flash( "success_msg" );
    res.locals.error_msg = req.flash( "error_msg" );
    res.locals.error = req.flash( "error" );
    res.locals.validationErrors = req.flash( "validationErrors" );
    res.locals.user = req.session.user || null;
    next();
}