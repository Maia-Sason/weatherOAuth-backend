const express = require("express"); // Express framework
const passport = require("./helpers/passportFacebook"); // passport authentication for node (Oauth)
const path = require("path");

require("dotenv").config();

const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); // Parse requests/response Obj's
const session = require("express-session"); // Store user data btwn HTTP requests and make it stateful

authRouter = require("./routes/auth");
apiRouter = require("./routes/weather");
apiUser = require("./routes/user");

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
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use("/user", apiUser);

app.use(express.static(path.join(__dirname, "build")));
app.use("/login", express.static(path.join(__dirname, "build")));
app.use("/logout", express.static(path.join(__dirname, "build")));
app.use("/sources", express.static(path.join(__dirname, "build")));
app.use("/terms", express.static(path.join(__dirname, "build")));

const port = process.env.PORT || 3003;

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
