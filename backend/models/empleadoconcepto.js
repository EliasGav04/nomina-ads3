'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmpleadoConcepto extends Model {
    static associate(models) {
      EmpleadoConcepto.belongsTo(models.Empleado, { foreignKey: 'id_empleado' });
      EmpleadoConcepto.belongsTo(models.Concepto, { foreignKey: 'id_concepto' });
    }
  }
  EmpleadoConcepto.init({
    id_empleado_concepto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    valor: DataTypes.DECIMAL(10,2),
    fecha_desde: DataTypes.DATEONLY,
    fecha_hasta: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'EmpleadoConcepto',
    tableName: 'empleado_concepto',
    timestamps: true
  });
  return EmpleadoConcepto;
};
