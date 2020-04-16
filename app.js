require("dotenv").config();

const path = require("path");
const express = require("express");

// Launging App
const app = express();

// Static Folder and view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.urlencoded({ extended: false }));

// Connecting to database
const mongoose = require("mongoose");
mongoose
  .connect(require("./config/database").database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected...");
  })
  .catch((err) => console.log(err));

// Connect Flash
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Express Session
const session = require("express-session");
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

// Passport
const passport = require("passport");
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use("*", (req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.MY_EMAIL = process.env.MY_EMAIL;
  next();
});

// Set Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/articles", require("./routes/articles"));

// Launching site
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`App is running on port ${PORT}...`));
