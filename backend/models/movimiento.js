'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Movimiento extends Model {
    static associate(models) {
      Movimiento.belongsTo(models.Periodo, { foreignKey: 'id_periodo' });
      Movimiento.belongsTo(models.Empleado, { foreignKey: 'id_empleado' });
      Movimiento.belongsTo(models.Concepto, { foreignKey: 'id_concepto' });
    }
  }
  Movimiento.init({
    id_movimiento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    monto: DataTypes.DECIMAL(10,2),
    descripcion: DataTypes.TEXT,
    estado: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'Movimiento',
    tableName: 'movimientos',
    timestamps: true
  });
  return Movimiento;
};
