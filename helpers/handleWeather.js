const Sequelize = require("sequelize");
const bodyParser = require("body-parser");

const getWeather = (request, response) => {
  /* Using GeoLocation API and Openweather API
    Make a request to Geolocation API to find user's coordinates,
    Save coordinates into user weather db field with timestamp now,
    Retrieve weather info using coordinates just gotten from API and
    return [ JSON object ] to user about current weather, or Error!
    
    Maybe split up the two processes as they can lead to
    unnecessary api calls */
};

const getAllWeather = (request, response) => {
  /* Make a query to db, get all location
  coordinates from all time user saved location info,
  return [ JSON object ] of weather for each location!
  Or return error */
};

module.exports = {
  getWeather,
  getAllWeather,
};
