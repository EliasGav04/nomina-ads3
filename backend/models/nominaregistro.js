'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NominaRegistro extends Model {
    static associate(models) {
      NominaRegistro.belongsTo(models.Periodo, { foreignKey: 'id_periodo' });
      NominaRegistro.belongsTo(models.Empleado, { foreignKey: 'id_empleado' });
      NominaRegistro.hasMany(models.NominaDetalle, { foreignKey: 'id_registro' });
    }
  }
  NominaRegistro.init({
    id_registro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    salario_bruto: DataTypes.DECIMAL(10,2),
    total_deducciones: DataTypes.DECIMAL(10,2),
    salario_neto: DataTypes.DECIMAL(10,2)
  }, {
    sequelize,
    modelName: 'NominaRegistro',
    tableName: 'nomina_registros',
    timestamps: true
  });
  return NominaRegistro;
};