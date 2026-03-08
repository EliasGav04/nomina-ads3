'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Rol, { foreignKey: 'id_rol' });
    }
  }
  Usuario.init({
    id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario: DataTypes.STRING(50),
    clave_hash: DataTypes.STRING(255),
    ultimo_acceso: DataTypes.DATE,
    estado: DataTypes.STRING(20)
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true
  });
  return Usuario;
};