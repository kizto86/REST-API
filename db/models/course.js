const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
          validate:{
            notNull:{
                msg:"Please provide a value for title"
            },
              notEmpty:{
                msg:"The course title cannot be empty"
              },
          },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
          validate:{
              notNull:{
                  msg:"Please provide a value for description"
              },
              notEmpty:{
                  msg:"The course description cannot be empty"
              },
          },
      },
      estimatedTime: {
        type: Sequelize.STRING,
      },
      materialsNeeded: {
        type: Sequelize.STRING,
      },
    },
    { sequelize }
  );
  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: "owner",
      foreignKey: { fieldName: "userId", allowNull: false },
    });
  };
  return Course;
};
