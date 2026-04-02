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
    id_empleado: { type: DataTypes.INTEGER, allowNull: false },
    id_concepto: { type: DataTypes.INTEGER, allowNull: false },
    valor: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    fecha_desde: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_hasta: { type: DataTypes.DATEONLY, allowNull: true }
  }, {
    sequelize,
    modelName: 'EmpleadoConcepto',
    tableName: 'empleado_concepto',
    timestamps: true
  });
  return EmpleadoConcepto;
};
