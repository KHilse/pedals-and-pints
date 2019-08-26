'use strict';
module.exports = (sequelize, DataTypes) => {
  const participant = sequelize.define('participant', {
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    profile_img_url: DataTypes.STRING
  }, {});
  participant.associate = function(models) {
    // associations can be defined here
    models.participant.belongsToMany(models.event, { through: models.eventsParticipants });
  };
  return participant;
};