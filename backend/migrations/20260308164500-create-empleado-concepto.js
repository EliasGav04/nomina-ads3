'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('empleado_concepto', {
      id_empleado_concepto: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      id_empleado: {
        type: Sequelize.INTEGER,
        references: { model: 'empleados', key: 'id_empleado' }
      },
      id_concepto: {
        type: Sequelize.INTEGER,
        references: { model: 'conceptos', key: 'id_concepto' }
      },
      valor: Sequelize.DECIMAL(10,2),
      fecha_desde: Sequelize.DATEONLY,
      fecha_hasta: Sequelize.DATEONLY,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('empleado_concepto');
  }
};
