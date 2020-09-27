const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const { sequelize, models } = require("../db");

const { User, Course } = models;

//Custom  Authentication Middleware
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

//Send a GET  request to /courses to Read  a list of courses
router.get(
  "/courses",
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
        next(error);
      } else {
        throw error;
      }
    }
  })
);

//Send a GET request to /courses/:id to READ a course
router.get(
  "/courses/:id",
  asyncHandler(async (req, res, next) => {
    try {
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
      //checks if the id passed in the where clause points to an existing course
      if (course) {
        res.json(course);
      } else {
        res.status(404).json({
          message: "Course does not exist",
        });
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        console.error("Validation errors: ", errors);
        next(error);
      } else {
        throw error;
      }
    }
  })
);

//Send a POST  request to /courses to CREATE  a course
router.post(
  "/courses",
  asyncHandler(async (req, res, next) => {
    const course = req.body;
    try {
      const courses = await Course.create({
        title: course.title,
        description: course.description,
        estimatedTime: course.estimatedTime,
        materialsNeeded: course.materialsNeeded,
        userId: course.userId,
      });
      const courseid = courses.dataValues.id;
      res.status(201).location(`/courses/${courseid}`).end();
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        console.error("Validation errors: ", errors);
        next(error);
      } else {
        throw error;
      }
    }
  })
);

//send a PUT request to /course/:id to update a course
router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const user = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    try {
      //checks that the :id points to a valid course(the course exists)
      if (course) {
        //checks if the course belongs to the current user
        if (course.userId === user.id) {
          await Course.update(
            {
              title: req.body.title,
              description: req.body.description,
              estimatedTime: req.body.estimatedTime,
              materialsNeeded: req.body.materialsNeeded,
            },
            { where: { id: req.params.id } }
          );
          res.status(204).end();
        } else {
          res.status(403).json({
            message:
              "Authentication Failed. You do not have access to update this course",
          });
        }
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        console.error("Validation errors: ", errors);
        next(error);
      } else {
        throw error;
      }
    }
  })
);

//Send a DELETE request to /course/:id to Delete a course
router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      const user = req.currentUser;
      const course = await Course.findByPk(req.params.id);
      //checks if the course belongs to the current authenticated user
      if (course.userId === user.id) {
        await course.destroy();
        res.status(204).end();
      } else {
        res.status(403).json({
          message:
            "Authentication Failed. You do not have access to delete this course",
        });
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        console.error("Validation errors: ", errors);
        next(error);
      } else {
        throw error;
      }
    }
  })
);

module.exports = router;
