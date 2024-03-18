const express = require("express");
const cors = require("cors");
const session = require("express-session");
const app = express();
const { PORT } = require("./config");
const generateToken = require("./utils/tokenHelper");
app.use(cors());
require("./db");
const passport = require("passport");
const User = require("./models/userModel");
const TwitterStrategy = require("passport-twitter").Strategy;
const {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  CALLBACK_URL,
} = require("./config");
const userRoutes = require("./routes/userRoutes");
const keywordRoute = require("./routes/keywordRoutes");
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
require("./cron/index");
// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is runing!");
});
app.use("/api/keyword", keywordRoute);
app.use("/api/user/admin", userRoutes);
passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_API_KEY,
      consumerSecret: TWITTER_API_SECRET_KEY,
      callbackURL: CALLBACK_URL,
    },
    function (token, tokenSecret, profile, done) {
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        imageUrl: profile?.photos?.[0]?.value ?? "",
        twitterAccountCreated: profile?._json?.created_at
          ? new Date(profile?._json?.created_at).toISOString()
          : "",
      };
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

app.get("/api/user/twitter/login", passport.authenticate("twitter"));

app.get(
  "/api/user/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  async function (req, res) {
    console.log("req.user", req.user);
    console.log("req.user", req?.session);
    const existUser = await User.findOne({ twitterId: req.user.id });
    if (!existUser) {
      const newUser = await User.create({
        twitterId: req.user.id,
        username: req.user.username,
        imageUrl: req.user.imageUrl,
        twitterAccountCreated: req.user.twitterAccountCreated,
      });
      const token = generateToken(newUser._id);
      return res.redirect(`http://localhost:5173/?token=${token}`);
    }
    const token = generateToken(existUser._id);
    return res.redirect(`http://localhost:5173/?token=${token}`);
  }
);

const port = PORT || 3000;
console.log("Port: " + port);
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
