const passport = require("passport");
require("dotenv").config();

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
      callbackURL: process.env.FACEBOOK_CALLBACK,
      profileFields: ["id", "displayName", "picture", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      let user1 = await db.findUser(profile);
      console.log("currently " + user1.firstName);
      done(null, await db.findUser(profile));
    }
  )
);

module.exports = passport;
