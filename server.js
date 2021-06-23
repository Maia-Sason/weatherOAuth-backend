const db = require("./queries"); // Database
const express = require("express"); // Express framework
const cors = require("cors"); // cors cross origin resource sharing :)
const passport = require("passport"); // passport authentication for node (Oauth)

const bcrypt = require("bcryptjs"); // encrypt passwords

const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); // Parse requests/response Obj's
const session = require("express-session"); // Store user data btwn HTTP requests and make it stateful

app.use(passport.initialize());
app.use(passport.session());

var usersRouter = require("./routes/users");

var fs = require("fs");
var http = require("http");
var https = require("https");
var privateKey = fs.readFileSync("./selfsigned.key");
var certificate = fs.readFileSync("./selfsigned.crt", "utf8");

var credentials = { key: privateKey, cert: certificate };
app.use("/", usersRouter);

var httpsServer = https.createServer(credentials, app);
var httpServer = http.createServer(app);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

const port = 3004;

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
