module.exports = (sequelize, DataTypes) => {
  const LogEasyOcr = sequelize.define(
    "LogEasyOcr",
    {
      statusOcr: {
        type: DataTypes.STRING,
        allowNull: false
      },
      documentType: {
        type: DataTypes.STRING,
        allowNull: false
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
