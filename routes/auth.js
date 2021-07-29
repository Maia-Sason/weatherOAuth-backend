const router = require("express").Router();
const passport = require("../helpers/passportFacebook"); // passport authentication for node (Oauth)

router.get("/login/facebook", (request, response, next) => {
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

router.get("/logged", (request, response) => {
  // Redirect from server redirect right back to client! :)))
  response.redirect("/");
  console.log("Success!");
});

router.get("/return", (request, response, next) => {
  passport.authenticate("facebook", {
    failureRedirect: "/auth/login",
    successRedirect: "/auth/logged",
  })(request, response, next);
});

router.get("/", (request, response) => {
  console.log("trying to auth user");
  if (request.isAuthenticated()) {
    response.json({ success: `hello ${request.user.firstName}` });
  } else {
    response.json({ error: "YOU ARE NOT AUTHENTICATED" });
  }
});

module.exports = router;
