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
      systemName: {
        type: DataTypes.ENUM,
        values: ["abbyy", "ocr"],
        allowNull: false
      },
      startVerification: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endVerification: {
        type: DataTypes.DATE,
        allowNull: true
      },
      cancelVerification: {
        type: DataTypes.DATE,
        allowNull: true
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
      as: "UserName",
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    LogVerification.belongsTo(models.User, {
      as: "EditorName",
      foreignKey: {
        name: "editorId",
        allowNull: true
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  };

  return LogVerification;
};
