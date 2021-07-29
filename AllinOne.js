const db = require("./helpers/sequelizedb"); // Database
const express = require("express"); // Express framework
const cors = require("cors"); // cors cross origin resource sharing :)
const passport = require("./helpers/passportFacebook"); // passport authentication for node (Oauth)
const api_helper = require("./helpers/api_helpers");
const axios = require("axios");
const path = require("path");

require("dotenv").config();
var fs = require("fs");

const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); // Parse requests/response Obj's
const session = require("express-session"); // Store user data btwn HTTP requests and make it stateful

authRouter = require("./routes/auth");

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));

// app.use(passport.initialize());
// app.use(passport.session());

// // Facebook Passport:
// const Strategy = require("passport-facebook").Strategy;

// // serialize
// passport.serializeUser(function (user, cb) {
//   console.log("SERIALIZING... " + user.facebookID);
//   cb(null, user);
// });

// passport.deserializeUser(function (user, cb) {
//   console.log("DESERIALIZING... " + user.facebookID);
//   cb(null, user);
// });

// // Facebook

// passport.use(
//   new Strategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: process.env.FACEBOOK_CALLBACK,
//       profileFields: ["id", "displayName", "picture", "email"],
//     },
//     async function (accessToken, refreshToken, profile, done) {
//       let user1 = await db.findUser(profile);
//       console.log("currently " + user1.firstName);
//       done(null, await db.findUser(profile));
//     }
//   )
// );

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// app.use("/auth", authRouter);

app.get("/api/login/facebook", (request, response, next) => {
  console.log("trying to log in user");
  /* using Facebook Oauth, check if
    user associated with facebook exists in db,
    if not create a user for them and log them in 
    
    Response either success message or error message */

  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })(request, response, next);
  return;
});

app.get("/api/return", (request, response, next) => {
  passport.authenticate("facebook", {
    failureRedirect: "/api/login",
    successRedirect: "/api/logged",
  })(request, response, next);
});

app.get("/api/logged", (request, response) => {
  // Redirect from server redirect right back to client! :)))
  response.redirect("/");
  console.log("Success!");
});

app.get("/api/auth", (request, response) => {
  console.log("trying to auth user");
  if (request.isAuthenticated()) {
    response.json({ success: `hello ${request.user.firstName}` });
  } else {
    response.json({ error: "YOU ARE NOT AUTHENTICATED" });
  }
});

app.get("/api/user", async (request, response) => {
  console.log("Loading user information");
  if (request.isAuthenticated()) {
    let table = await db.LocationTable.findOne({
      where: { UserId: request.user.id },
    });

    if (table === undefined) {
      table = await db.newTable(request.user);
    }

    let locations = await db.Location.findAll({
      attributes: ["longitude", "latitude"],
      where: { LocationTableId: table.id },
    });

    data = Object.assign({}, request.user, { locations: locations });

    response.json(data);
  } else {
    response.json({ error: "User not authenticated!" });
  }
});

app.get("/api/all", async (request, response) => {
  if (!request.isAuthenticated()) {
    response.json({
      error: "User needs to be authenticated for this feature!",
    });
  } else {
    let table = await db.LocationTable.findOne({
      where: { UserId: request.user.id },
    });
    let locations = await db.Location.findAll({
      attributes: ["longitude", "latitude"],
      where: { LocationTableId: table.id },
    });
    let list = [];

    for (location of locations) {
      const latitude = location.latitude;
      const longitude = location.longitude;
      try {
        const res = await axios.get(
          `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${process.env.WEATHER_API_KEY}`
        );
        list.push(res.data);
      } catch (err) {
        response.json({
          error: "There was an issue retrieving weather information.",
        });
      }
    }
    response.json(list);
  }
});

app.post("/api/weather", async (request, response) => {
  let latitude = request.body.lat;
  let longitude = request.body.long;

  if (
    !request.isAuthenticated() &&
    (latitude == undefined || longitude == undefined)
  ) {
    response.json({
      error: "User needs to be authenticated for this feature!",
    });
  } else {
    try {
      const res = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${process.env.WEATHER_API_KEY}`
      );

      response.json(res.data);
    } catch (err) {
      response.json({
        error: "There was an issue retrieving weather information.",
      });
    }
  }
});

app.post("/api/location", async (request, response) => {
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

app.get("/api/logout", (request, response) => {
  request.logOut();
  response.json({ success: "Logged out" });
});

app.use(express.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3003;

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
