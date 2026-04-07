'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Concepto extends Model {
    static associate(models) {
      Concepto.hasMany(models.EmpleadoConcepto, { foreignKey: 'id_concepto' });
      Concepto.hasMany(models.Movimiento, { foreignKey: 'id_concepto' });
      Concepto.hasMany(models.NominaDetalle, { foreignKey: 'id_concepto' });
    }
  }
  Concepto.init({
    id_concepto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    concepto: DataTypes.STRING(100),
    tipo: DataTypes.ENUM('ingreso','deduccion'),
    naturaleza: DataTypes.ENUM('fijo','porcentaje','manual'),
    valor_defecto: DataTypes.DECIMAL(10,2),
    aplica_tope: DataTypes.BOOLEAN,
    tope_monto: DataTypes.DECIMAL(12,2),
    es_global: DataTypes.BOOLEAN,
    estado: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'Concepto',
    tableName: 'conceptos',
    timestamps: true
  });
  return Concepto;
};
