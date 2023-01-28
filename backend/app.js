const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const ejs = require("ejs");

const dotenv = require("dotenv");
dotenv.config("../");

const app = express();

app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.ID,
      clientSecret: process.env.SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      // Use the profile information to authenticate the user
      // ...
      cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/login", (req, res) => {
  res.render(path.join(__dirname, "..", "login.ejs"));
});

app.get("/dashboard", (req, res) => {
  // check if user is logged in
  if (req.isAuthenticated()) {
    console.log(req);
    res.render(path.join(__dirname, "..", "dashboard.ejs"), { user: req.user });
  } else {
    res.redirect("/login");
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/dashboard");
  }
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
