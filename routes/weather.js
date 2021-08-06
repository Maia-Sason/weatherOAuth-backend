const router = require("express").Router();
const axios = require("axios");
const db = require("../helpers/sequelizedb");

router.get("/all", async (request, response) => {
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
    console.log("trying to go through all locations");
    for (location of locations) {
      console.log(JSON.stringify(location));
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

router.post("/weather", async (request, response) => {
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

router.post("/location", async (request, response) => {
  if (!request.isAuthenticated()) {
    response.json({
      error: "User needs to be authenticated for this feature!",
    });
  }
  console.log("Posting new location");
  let latitude = request.body.lat;
  let longitude = request.body.long;

  console.log(`long, lat before db: ${longitude}, ${latitude}`);

  await db.setNewLocation(longitude, latitude, request.user);
  response.json({ success: `Your location is ${longitude}, ${latitude}` });
});

module.exports = router;
