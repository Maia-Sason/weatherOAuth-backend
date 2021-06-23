const { Sequelize, Model, DataTypes } = require("sequelize");
const { Pool, Client } = require("pg");
require("dotenv").config();
express = require("express");

const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); // Parse requests/response Obj's
const session = require("express-session"); // Store user data btwn HTTP requests and make it stateful

const db = require("./sequelizedb");

console.log(
  `The current dotenv in handleUser = ${process.env.FACEBOOK_CLIENT_ID}`
);

const passport = require("passport"); // passport authentication for node (Oauth)

app.use(passport.initialize());
app.use(passport.session());

// Facebook Passport:
const Strategy = require("passport-facebook").Strategy;

// KEEP SECRET KEYS SECRET AND AWAY FROM PRODUCTION!!
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(
  new Strategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:3003/return",
      profile: ["id", "displayName"],
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log("arrived ");
      let user1 = await db.findUser(profile);
      console.log("currently " + user1.firstName);
      done(null, user1);
    }
  )
);

const pool = new Pool();

const logUser = (request, response, next) => {
  console.log("trying to log in user");
  // response.status(200).json({ Test: "log in route" });
  /* using Facebook Oauth, check if
   user associated with facebook exists in db,
   if not create a user for them and log them in 
   
   Response either success message or error message */

  passport.authenticate("facebook")(request, response, next);
  return;
};

const callback = (request, response, next) => {
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    failureRedirect: "/",
  })(request, response, next);
};

const isAuthenticated = (request, response) => {
  response.status(200).json({ Test: "Test auth route" });
  /* Find out if user is currently authenticated by
    retrieving session data. If session data exists,
    user is auth, send success message, else send fail message */
};

const loadUser = (request, response) => {
  response.status(200).json({ User: user });
  /* make a query to DB with auth user's id,
    and return [ JSON object ] of user info, or error */
};

const logOutUser = (request, response) => {
  /* destroy user session and clear Oauth access?? 
    return success message or error message */
};

module.exports = {
  logUser,
  isAuthenticated,
  loadUser,
  logOutUser,
  callback,
};
