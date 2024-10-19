require("dotenv").config();
const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join("./public")));
app.use(expressEjsLayouts);
 
app.set("view engine", "ejs");
app.set('views', path.join('./views'))
app.set("layout", "./layouts/main");

// app.get('/',(req,res)=>res.send("debug"))

const routes = require("./server/routes/route.js");
app.use("/", routes);
 
app.listen(port, () =>
  console.log(`Server is successfully running on Port ${port}`)
);
