const express = require("express");
const router = express.Router();

const { sequelize, models } = require("../db");

const { Course, User } = models;

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

//Send a POST  request to /users to CREATE  a user
router.post(
  "/users",
  asyncHandler(async (req, res, next) => {
    const user = req.body;
    try {
      if (
        user.firstName &&
        user.lastName &&
        user.emailAddress &&
        user.password
      ) {
         await User.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          emailAddress: req.body.emailAddress,
          password: req.body.password,
        });
        res.status(201).location("/").end();
      } else {
        res.status(400).json({
          message:
            "firstName, lastName, emailAddress and password are required",
        });
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        console.error("Validation errors: ", errors);
      } else {
        throw error;
      }
    }
  })
);

//Send a GET request to /users to READ the current authenticated user

module.exports = router;
