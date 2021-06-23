const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("sqlite:memory:"); //make sure to change this to Postgres

const testDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to db has been established successfully!");
  } catch (error) {
    console.error("Unable to connect to database: ", error);
  }
};

testDB();

class LocationTable extends Model {}

LocationTable.init({});

class Location extends Model {}

Location.init({
  longitude: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

class User extends Model {}

User.init(
  {
    facebookID: {
      type: DataTypes.STRING,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    picture: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize, // Pass the connection instance
    modelName: "User", // Choose a model name
  }
);

console.log(User === sequelize.models.User); // True, defined model is class itself

// sync is promise, sync alter only alters if table is different from last time!
const syncDB = async () => {
  await sequelize.sync({ alter: true });
  console.log("All models were synchronized successfully!");
};

const findUser = async (profile) => {
  let user = await User.findOne({ where: { facebookID: profile.id } });
  if (user == null) {
    console.log("No user exists... creating user");
    user = new User({
      facebookID: profile.id,
      firstName: profile.displayName,
      picture: profile.picture,
    });
    user.save();
    console.log("saving");
    return user;
  } else {
    user.firstName = profile.displayName;
    user.picture = profile.picture;
    user.email = profile.email;
    return user;
  }
};

User.hasOne(LocationTable);
LocationTable.belongsTo(User);
LocationTable.hasMany(Location);
Location.belongsTo(LocationTable);

syncDB();

module.exports = {
  User,
  Location,
  findUser,
};
