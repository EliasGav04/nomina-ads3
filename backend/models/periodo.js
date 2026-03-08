'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Periodo extends Model {
    static associate(models) {
      Periodo.hasMany(models.Movimiento, { foreignKey: 'id_periodo' });
      Periodo.hasMany(models.NominaRegistro, { foreignKey: 'id_periodo' });
    }
  }
  Periodo.init({
    id_periodo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periodo: DataTypes.STRING(100),
    fecha_inicio: DataTypes.DATEONLY,
    fecha_final: DataTypes.DATEONLY,
    fecha_pago: DataTypes.DATEONLY,
    estado: DataTypes.ENUM('Abierto','Procesado','Cerrado')
  }, {
    sequelize,
    modelName: 'Periodo',
    tableName: 'periodos',
    timestamps: true
  });
  return Periodo;
};
