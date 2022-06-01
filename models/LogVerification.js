module.exports = (sequelize, DataTypes) => {
  const LogVerification = sequelize.define(
    "LogVerification",
    {
      projectName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      documentName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      documentStatus: {
        type: DataTypes.STRING,
        allowNull: false
      },
      startVerification: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endVerification: {
        type: DataTypes.DATE,
        allowNull: false
      },
      cancelVerification: {
        type: DataTypes.DATE,
        allowNull: false
      },
      oldValue: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      currentValue: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      underscored: true
    }
  );

  LogVerification.associate = models => {
    LogVerification.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return LogVerification;
};