module.exports = (sequelize, DataTypes) => {
  const LogSearch = sequelize.define(
    "LogSearch",
    {
      searchText: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      underscored: true
    }
  );

  LogSearch.associate = models => {
    LogSearch.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    });
  };

  return LogSearch;
};
