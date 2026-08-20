// Session configuration with MongoDB store

const MongoStore = require( 'connect-mongo' ).default;

module.exports = {
    secret: process.env.SESSION_SECRET,
    name: "sessionId",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create( {
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60,
        autoRemove: "native",
    } ),
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "strict",
    },
}
