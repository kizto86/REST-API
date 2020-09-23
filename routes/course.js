const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");

const { sequelize, models } = require("../db");

const { User, Course } = models;

const authenticateUser = require("../middleware/authenticateUser");

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

//Send a POST  request to /courses to CREATE  a course
router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const course = req.body;
    try {
      if (course.title && course.description) {
        const courses = await Course.create(req.body);
        res.status(201).json(courses);
      } else {
        res.status(400).json({
          message: "course title and course description are required",
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

//Send a GET  request to /courses to Read  a list of courses
router.get(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      const courses = await Course.findAll({
        attributes: ["id", "title", "description", "estimatedTime"],
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["firstName", "lastName", "emailAddress"],
          },
        ],
      });
      res.json(courses);
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

//Send a GET request to /courses/:id to READ(view) a course
router.get(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      //const _id = req.params.id;
      const course = await Course.findOne({
        attributes: ["id", "title", "description", "estimatedTime"],
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["firstName", "lastName", "emailAddress"],
          },
        ],
      });
      if (course) {
        res.json(course);
      } else {
        res.status(404).json({
          message: "course does not exist",
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

//send a PUT request to /course/:id to update a course

//Send a DELETE request to /course/:id to Delete a course
router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      const _id = req.params.id;
      const course = await Course.findByPk(_id);
      if (course) {
        await course.destroy();
        res.status(204).end();
      } else {
        res.status(404).json({ message: "course not found" });
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

module.exports = router;
