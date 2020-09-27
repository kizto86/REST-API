const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide a value for Firstname",
          },
          notEmpty: {
            msg: "Firstname cannot be empty",
          },
        },
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide a value for Lastname",
          },
          notEmpty: {
            msg: "Lastname cannot be empty",
          },
        },
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg:
            "Oops,Looks like you already have an account with this email address. Email address must be unique",
        },
        validate: {
          isEmail: {
            msg: "The email address you provided is not a valid email",
          },
          notEmpty: {
            msg: "Email Address cannot be empty",
          },
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide a value for the password",
          },
          notEmpty: {
            msg: "Password cannot be empty",
          },
        },
      },
    },
    { sequelize }
  );
  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: "owner",
      foreignKey: { fieldName: "userId", allowNull: false },
    });
  };
  return User;
};
