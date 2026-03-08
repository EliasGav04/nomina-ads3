'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Area extends Model {
    static associate(models) {
      Area.hasMany(models.Empleado, { foreignKey: 'id_area' });
    }
  }
  Area.init({
    id_area: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    area: DataTypes.STRING(50),
    estado: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'Area',
    tableName: 'areas',
    timestamps: true
  });
  return Area;
};
