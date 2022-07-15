module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      employeeId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      underscored: true
    }
  );

  User.associate = models => {
    User.belongsTo(models.Role, {
      foreignKey: {
        name: "roleId",
        allowNull: false
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    User.hasMany(models.LogSearch, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    User.hasMany(models.LogVerification, {
      as: "UserName",
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // User.hasMany(models.LogVerification, {
    //   as: "EditorName",
    //   foreignKey: {
    //     name: "editorId",
    //     allowNull: true
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE"
    // });

    User.hasMany(models.LogEasyOcr, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    User.hasMany(models.LogKmp, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  };

  return User;
};
