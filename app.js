"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const userRoute = require("./routes/user");
const courseRoute = require("./routes/course");

const { sequelize, models } = require("./db");

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan("dev"));

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!",
  });
});

// Add routes
app.use("/api", userRoute);
app.use("/api", courseRoute);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

(async () => {
  try {
    //Test the connection to the database
    await sequelize.authenticate();
    console.log("Connection has been established Successfully ");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// set our port
app.set("port", process.env.PORT || 3000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);

  sequelize.sync().then(() => {
    console.log("Synchronizing the model with the database");
  });
});
