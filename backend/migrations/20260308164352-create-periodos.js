'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('periodos', {
      id_periodo: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      periodo: Sequelize.STRING(100),
      fecha_inicio: Sequelize.DATEONLY,
      fecha_final: Sequelize.DATEONLY,
      fecha_pago: Sequelize.DATEONLY,
      estado: Sequelize.ENUM('Abierto','Procesado','Cerrado'),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('periodos');
  }
};
