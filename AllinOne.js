const db = require("./helpers/sequelizedb"); // Database
const express = require("express"); // Express framework
const cors = require("cors"); // cors cross origin resource sharing :)
const passport = require("passport"); // passport authentication for node (Oauth)

require("dotenv").config();
var fs = require("fs");

const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); // Parse requests/response Obj's
const session = require("express-session"); // Store user data btwn HTTP requests and make it stateful

app.use(
  cors({
    origin: "https://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));

app.use(passport.initialize());
app.use(passport.session());

// Facebook Passport:
const Strategy = require("passport-facebook").Strategy;

// serialize
passport.serializeUser(function (user, cb) {
  console.log("SERIALIZING... " + user.facebookID);
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  console.log("DESERIALIZING... " + user.facebookID);
  cb(null, user);
});

// Facebook
passport.use(
  new Strategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:3003/return",
      profileFields: ["id", "displayName", "picture", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log("arrived ");
      console.log(JSON.stringify(profile));
      let user1 = await db.findUser(profile);
      console.log("currently " + user1.firstName);
      done(null, await db.findUser(profile));
    }
  )
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/login/facebook", (request, response, next) => {
  console.log("trying to log in user");
  // response.status(200).json({ Test: "log in route" });
  /* using Facebook Oauth, check if
    user associated with facebook exists in db,
    if not create a user for them and log them in 
    
    Response either success message or error message */

  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })(request, response, next);
  return;
});

app.get("/return", (request, response, next) => {
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    successRedirect: "/home",
  })(request, response, next);
});

app.get("/home", (request, response) => {
  if (request.isAuthenticated()) {
    response.json({ User: `hello ${request.user.firstName}` });
  } else {
    response.json({ error: "YOU ARE NOT AUTHENTICATED" });
  }
});

const port = 3003;

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
