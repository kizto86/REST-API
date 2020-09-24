const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const { check, validationResult } = require("express-validator");

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

//Send a GET request to /courses/:id to READ(view) a course
router.get(
  "/courses/:id",
  //authenticateUser,
  asyncHandler(async (req, res, next) => {
    //const user = req.currentUser;
    const courseID = await Course.findByPk(req.params.id);
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
      //checks if the course belongs to the current authenticated user
      //if (courseID.userId === user.id) {
      //checks if any id passed in the where clause points to an existing
      if (course) {
        res.json(course);
      } else {
        res.status(404).json({
          message: "course does not exist",
        });
      }
      //} else {
      //res.status(403).json({
      //message:
      //"Authentication Failed. You do not have access to view this course",
      //});
      //}
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
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const user = req.currentUser;
    const course = req.body;
    try {
      if (course.title && course.description) {
        const courses = await Course.create(course);
        const courseid = courses.dataValues.id;
        res.status(201).location(`/courses/${courseid}`).end();
      } else {
        res.status(400).json({
          message: "course title and course description are required",
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

//send a PUT request to /course/:id to update a course
router.put(
  "/courses/:id",
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage("Please provide a value for title"),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage("Please provide a value for description"),
  ],
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const user = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    try {
      //gets the validation result from the Request object
      const errors = validationResult(req);
      //checks if there are validation errors
      if (!errors.isEmpty()) {
        //use the array map() method to get the list of error messages
        const errorMessages = errors.array().map((error) => error.msg);
        res.status(400).json({ errors: errorMessages });
      } else {
        //checks that the id points to a valid course(the course exists)
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
