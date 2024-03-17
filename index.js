const express = require("express");
const cors = require("cors");
const session = require('express-session');
const userRoutes = require("./routes/userRoutes");
const app = express();
app.use(cors());
require("./db");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const TwitterStrategy = require("passport-twitter").Strategy;
// const runCronJob = require("./cronJob");
// Configure Twitter Strategy
passport.use(
  new TwitterStrategy(
    {
      consumerKey: "bsLH3788r1gugSqjStdJ08D9h",
      consumerSecret: "3Y89TH9TUt89RVmWrfEBZ4wcCSREILsN4FAIcPxHLANtQdpD5b",
      callbackURL: "http://localhost:4000/api/user/twitter/callback",
    },
    function (token, tokenSecret, profile, done) {
      // You can handle user creation/login here
      // For simplicity, let's assume we have a user object from database
      console.log(';profile',profile)
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
      };
      console.log('user' , user)
      return done(null, user);
    }
  )
);
// Serialize and Deserialize User
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Configure Express
app.use(
  session({ secret: "your_secret_here", resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
const { PORT } = require("./config");

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is runing!");
});

// app.use("/api/user", userRoutes);
app.get("/api/user/twitter/login", passport.authenticate("twitter"));

app.get(
  "/api/user/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

const port = PORT || 3000;
console.log("Port: " + port);
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
