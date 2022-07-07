module.exports = (sequelize, DataTypes) => {
  const LogEasyOcr = sequelize.define(
    "LogEasyOcr",
    {
      projectName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      documentName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      statusOcr: {
        type: DataTypes.STRING,
        allowNull: false
      },
      statusCa: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sendCa: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      documentType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      errorDescription: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      underscored: true
    }
  );

  LogEasyOcr.associate = models => {
    LogEasyOcr.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  };

  return LogEasyOcr;
};
