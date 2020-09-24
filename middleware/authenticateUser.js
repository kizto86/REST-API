const auth = require("basic-auth");
const bcryptjs = require("bcryptjs");

const { sequelize, models } = require("../db");

const { User } = models;
//custom middleware function for authenticating users
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);

  if (credentials) {
    const users = await User.findAll();
    const user = users.find((u) => u.emailAddress === credentials.name);
    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );
      if (authenticated) {
        req.currentUser = user;
      } else {
        message = `Authentication failure for user: ${user.username}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }
  if (message) {
    console.warn(message);
    res.status(401).json({ message: "Access Denied" });
  } else {
    next();
  }
};

module.exports = authenticateUser;
