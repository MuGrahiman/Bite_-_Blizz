const mongoose = require("mongoose");


const MongoDB_USER = process.env.MONGODB_USER
const MongoDB_PASS = encodeURIComponent(process.env.MONGODB_PASS)
const MongoDB_CLUSTER =  process.env.MONGODB_CLUSTER
const MongoDB_DB = process.env.MONGODB_DB
const MongoDB_URI = `mongodb+srv://${MongoDB_USER}:${MongoDB_PASS}@${MongoDB_CLUSTER}.mongodb.net/${MongoDB_DB}?retryWrites=true&w=majority`;

mongoose.connect(MongoDB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("Database Connected Successfully"));

// Models

require('./Category')
require('./Recipe')