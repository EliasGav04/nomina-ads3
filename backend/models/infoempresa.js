'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Infoempresa extends Model {
    static associate(models) {

    }
  }
  Infoempresa.init({
    id_empresa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: DataTypes.STRING(100),
    razon_social: DataTypes.STRING(150),
    rtn: DataTypes.STRING(20),
    direccion: DataTypes.STRING(250),
    telefono: DataTypes.STRING(20),
    correo: DataTypes.STRING(150),
    sitio_web: DataTypes.STRING(150),
    codigo_moneda: DataTypes.STRING(3),
    tope_segurosocial_empleado: DataTypes.DECIMAL(10,2),
    logo: DataTypes.BLOB('medium'),
    logo_mime: DataTypes.STRING(50)
  }, {
    sequelize,
    modelName: 'Infoempresa',
    tableName: 'infoempresa',
    timestamps: true
  });
  return Infoempresa;
};
