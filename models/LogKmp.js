module.exports = (sequelize, DataTypes) => {
  const LogKmp = sequelize.define(
    "LogKmp",
    {
      projectName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      documentName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      statusKmp: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      underscored: true
    }
  );

  LogKmp.associate = models => {
    LogKmp.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  };

  return LogKmp;
};
