'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('conceptos', {
      id_concepto: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      concepto: Sequelize.STRING(100),
      tipo: Sequelize.ENUM('ingreso','deduccion'),
      naturaleza: Sequelize.ENUM('fijo','porcentaje','manual'),
      regla_calculo: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'normal' },
      tramos_json: { type: Sequelize.TEXT('long'), allowNull: true },
      valor_defecto: Sequelize.DECIMAL(10,2),
      aplica_tope: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      tope_monto: { type: Sequelize.DECIMAL(12,2), allowNull: true },
      es_global: Sequelize.BOOLEAN,
      estado: Sequelize.STRING(20),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('conceptos');
  }
};
