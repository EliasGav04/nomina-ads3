'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NominaDetalle extends Model {
    static associate(models) {
      NominaDetalle.belongsTo(models.NominaRegistro, { foreignKey: 'id_registro' });
      NominaDetalle.belongsTo(models.Concepto, { foreignKey: 'id_concepto' });
    }
  }
  NominaDetalle.init({
    id_detalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_registro: { type: DataTypes.INTEGER, allowNull: false },
    id_concepto: { type: DataTypes.INTEGER, allowNull: false },
    monto: DataTypes.DECIMAL(10,2)
  }, {
    sequelize,
    modelName: 'NominaDetalle',
    tableName: 'nomina_detalles',
    createdAt: true,
    updatedAt: false  
  });
  return NominaDetalle;
};
