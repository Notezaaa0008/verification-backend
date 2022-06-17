module.exports = (sequelize, DataTypes) => {
  const StatusDocAbbyy = sequelize.define(
    "StatusDocAbbyy",
    {
      projectName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      notificationStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      underscored: true
    }
  );

  return StatusDocAbbyy;
};
