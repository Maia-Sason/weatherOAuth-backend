const router = require("express").Router();
const db = require("../helpers/sequelizedb");

router.get("/", async (request, response) => {
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

module.exports = router;
