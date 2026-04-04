'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Empleado extends Model {
    static associate(models) {
      Empleado.belongsTo(models.Area, { foreignKey: 'id_area' });
      Empleado.hasMany(models.EmpleadoConcepto, { foreignKey: 'id_empleado' });
      Empleado.hasMany(models.Movimiento, { foreignKey: 'id_empleado' });
      Empleado.hasMany(models.NominaRegistro, { foreignKey: 'id_empleado' });
    }
  }
  Empleado.init({
    id_empleado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dni: DataTypes.STRING(20),
    nombre_completo: DataTypes.STRING(255),
    cargo: DataTypes.STRING(100),
    fecha_ingreso: DataTypes.DATEONLY,
    numero_ihss: DataTypes.STRING(30),
    cta_bancaria: DataTypes.STRING(40),
    salario_base: DataTypes.DECIMAL(10, 2),
    estado: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'Empleado',
    tableName: 'empleados',
    timestamps: true
  });
  return Empleado;
};
