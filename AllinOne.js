const db = require("./helpers/sequelizedb"); // Database
const express = require("express"); // Express framework
const cors = require("cors"); // cors cross origin resource sharing :)
const passport = require("passport"); // passport authentication for node (Oauth)
const api_helper = require("./helpers/api_helpers");
const axios = require("axios");

require("dotenv").config();
var fs = require("fs");

const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); // Parse requests/response Obj's
const session = require("express-session"); // Store user data btwn HTTP requests and make it stateful

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PATCH, DELETE, PUT",
    allowedHeaders: "Content-Type, Authorization",
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
    successRedirect: "/logged",
  })(request, response, next);
});

app.get("/logged", (request, response) => {
  // Redirect from server redirect right back to client! :)))
  response.redirect("http://localhost:3000/login");
});

app.get("/auth", (request, response) => {
  console.log("trying to auth user");
  if (request.isAuthenticated()) {
    response.json({ success: `hello ${request.user.firstName}` });
  } else {
    response.json({ error: "YOU ARE NOT AUTHENTICATED" });
  }
});

app.get("/user", (request, response) => {
  console.log("Loading user information");
  if (request.isAuthenticated()) {
    console.log(request.user);
    response.json(request.user);
  } else {
    response.json({ error: "User not authenticated!" });
  }
});

app.post("/weather", async (request, response) => {
  let latitude = request.body.lat;
  let longitude = request.body.long;

  if (
    !request.isAuthenticated() &&
    (latitude == undefined || longitude == undefined)
  ) {
    console.log("ERROR 1");
    response.json({
      error: "User needs to be authenticated for this feature!",
    });
  } else {
    try {
      const res = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${process.env.WEATHER_API_KEY}`
      );
      console.log(res.data);
      response.json(res.data);
    } catch (err) {
      console.log("ERROR 2");
      response.json({
        error: "There was an issue retrieving weather information.",
      });
    }
  }
});

app.post("/location", async (request, response) => {
  if (!request.isAuthenticated()) {
    response.json({
      error: "User needs to be authenticated for this feature!",
    });
  }
  console.log("Retrieving new location");
  let latitude = request.body.lat;
  let longitude = request.body.long;

  console.log(`long, lat before db: ${longitude}, ${latitude}`);

  await db.setNewLocation(longitude, latitude, request.user);
  response.json({ success: `Your location is ${longitude}, ${latitude}` });
});

const port = 3003;

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});