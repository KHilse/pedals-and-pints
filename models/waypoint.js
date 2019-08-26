'use strict';
module.exports = (sequelize, DataTypes) => {
  const waypoint = sequelize.define('waypoint', {
    name: DataTypes.STRING,
    untappd_id: DataTypes.INTEGER,
    stop_number: DataTypes.INTEGER,
    event_id: DataTypes.INTEGER
  }, {});
  waypoint.associate = function(models) {
    // associations can be defined here
    models.waypoint.hasOne(models.event);
  };
  return waypoint;
};