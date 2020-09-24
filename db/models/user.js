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
        unique: true,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
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
            msg: "The email address you provided is not valid email",
          },
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
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
