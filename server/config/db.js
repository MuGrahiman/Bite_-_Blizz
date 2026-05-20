/**
 * Database Configuration
 * Handles Mongoose connection with event listeners
*/
const mongoose = require( "mongoose" );

const MongoDB_USER = process.env.MONGODB_USER
const MongoDB_PASS = encodeURIComponent( process.env.MONGODB_PASS )
const MongoDB_CLUSTER = process.env.MONGODB_CLUSTER
const MongoDB_DB = process.env.MONGODB_DB
const MongoDB_URI = `mongodb+srv://${ MongoDB_USER }:${ MongoDB_PASS }@${ MongoDB_CLUSTER }.mongodb.net/${ MongoDB_DB }?retryWrites=true&w=majority`;


const connectDB = async () => {
    try {
        const conn = await mongoose.connect( MongoDB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        } );

        console.log( `MongoDB Connected: ${ conn.connection.host }` );
    } catch ( error ) {
        console.error( `Database connection failed: ${ error.message }` );
        // Exit process with failure — don't run app without DB
        process.exit( 1 );
    }
};

// Handle connection events
mongoose.connection.on( "error", ( err ) => {
    console.error( `MongoDB connection error: ${ err.message }` );
} );

mongoose.connection.on( "disconnected", () => {
    console.warn( "MongoDB disconnected. Attempting reconnection..." );
} );

module.exports = connectDB;