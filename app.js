require("dotenv").config();
const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");
const path = require("path");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join("./public")));
app.use(expressEjsLayouts);
app.use(cookieParser("CookingBlogSecure"));
app.use(
  session({
    secret: "CookingBlogSecretSession",
    saveUninitialized: true,
    resave: true,
    // cookie:{ maxAge: 60000 }
  })
);
app.use(flash());
app.use(fileUpload())
app.set("view engine", "ejs");
app.set("views", path.join("./views"));
app.set("layout", "./layouts/main");

// app.get('/',(req,res)=>res.send("debug"))

const routes = require("./server/routes/route.js");
app.use("/", routes);

app.listen(port, () =>
  console.log(`Server is successfully running on Port ${port}`)
);
