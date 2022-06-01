module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      roleName: {
        type: DataTypes.ENUM,
        values: ["Verification", "seniorVerification"],
        allowNull: false
      },
      roleDescription: {
        type: DataTypes.STRING,
        allowNull: false
      },
      permission: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      underscored: true
    }
  );

  Role.associate = models => {
    Role.hasMany(models.User, {
      foreignKey: {
        name: "roleId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return Role;
};
