const request = require("request");

const make_API_call = (url) => {
  request.get(url, (error, response, body) => {
    if (error) {
      return error;
    }
    return response;
  });
};

module.exports = {
  make_API_call,
};
