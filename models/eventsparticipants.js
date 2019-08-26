'use strict';
module.exports = (sequelize, DataTypes) => {
  const eventsParticipants = sequelize.define('eventsParticipants', {
    event_id: DataTypes.INTEGER,
    participant_id: DataTypes.INTEGER
  }, {});
  eventsParticipants.associate = function(models) {
    // associations can be defined here
    models.eventsParticipants.hasMany(models.drink);
  };
  return eventsParticipants;
};