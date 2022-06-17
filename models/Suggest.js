module.exports = (sequelize, DataTypes) => {
  const Suggest = sequelize.define(
    "Suggest",
    {
      correctWord: {
        type: DataTypes.STRING,
        allowNull: false
      },
      inCorrectWord: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      underscored: true
    }
  );

  return Suggest;
};
