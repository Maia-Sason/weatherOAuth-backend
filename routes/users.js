var express = require("express");
const handle = require("../helpers/handleUser");

var router = express.Router();
const bodyParser = require("body-parser");

var app = express();

const passport = require("passport"); // passport authentication for node (Oauth)
// Init passport session

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get("/login", (request, response) => {
  response.json({ msg: "login failed" });
});
// router.get("/current-weather", getWeather);
router.get("/home", handle.loadUser);

router.get("/login/facebook", handle.logUser);
router.get("/return", (request, response, next) => {
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    successRedirect: "/home",
  })(request, response, next);
});

router.get("/load-user", handle.loadUser);
router.get("/is-auth", handle.isAuthenticated);
router.get("/logout", handle.logOutUser);
// router.get("/all-weather", getAllWeather);

module.exports = router;
