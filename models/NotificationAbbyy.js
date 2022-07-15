module.exports = (sequelize, DataTypes) => {
  const NotificationAbbyy = sequelize.define(
    "NotificationAbbyy",
    {
      projectName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      batchName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      notificationStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      StatusDocId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      }
    },
    {
      underscored: true
    }
  );

  return NotificationAbbyy;
};
