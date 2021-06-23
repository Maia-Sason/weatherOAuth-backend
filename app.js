var createError = require("http-errors");
var express = require("express");
const Sequelize = require("sequelize");
const bodyParser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const port = 3001;

const db = require("./queries");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const { truncate } = require("fs");

var app = express();

const sequelize = new Sequelize("sqlite:chinook.db");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const Playlist = sequelize.define(
  "playlist",
  {
    id: {
      field: "PlaylistId",
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      field: "Name",
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  }
);

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("Database and table created!");
  })
  .catch((err) => {});

app.get("/api/playlists", function (request, response) {
  Playlist.findAll()
    .then((playlists) => {
      response.json(playlists);
      console.log(playlists);
    })
    .catch((error) => {});
});

app.get("/api", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API!" });
});

app.get("/api/users", db.getUsers);
app.get("/api/users/:id", db.getUserById);
app.post("/api/users", db.createUser);
app.put("/api/users/:id", db.updateUser);
app.delete("/api/users/:id", db.deleteUser);

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
