'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('nomina_detalles', {
      id_detalle: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      id_registro: {
        type: Sequelize.INTEGER,
        references: { model: 'nomina_registros', key: 'id_registro' }
      },
      id_concepto: {
        type: Sequelize.INTEGER,
        references: { model: 'conceptos', key: 'id_concepto' }
      },
      monto: Sequelize.DECIMAL(10,2),
      createdAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable('nomina_detalles');
  }
};
