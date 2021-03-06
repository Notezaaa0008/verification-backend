module.exports = (sequelize, DataTypes) => {
  const StatusDocAbbyy = sequelize.define(
    "StatusDocAbbyy",
    {
      projectName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      batchName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      documentCount: {
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
