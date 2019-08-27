'use strict';
module.exports = (sequelize, DataTypes) => {
  const drink = sequelize.define('drink', {
    name: DataTypes.STRING,
    abv: DataTypes.FLOAT,
    eventsWaypoints_id: DataTypes.INTEGER,
    size: DataTypes.STRING
  }, {});
  drink.associate = function(models) {
    // associations can be defined here
    models.drink.belongsTo(models.eventsParticipants);
  };
  return drink;
};