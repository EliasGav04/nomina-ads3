'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('movimientos', {
      id_movimiento: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      id_periodo: {
        type: Sequelize.INTEGER,
        references: { model: 'periodos', key: 'id_periodo' }
      },
      id_empleado: {
        type: Sequelize.INTEGER,
        references: { model: 'empleados', key: 'id_empleado' }
      },
      id_concepto: {
        type: Sequelize.INTEGER,
        references: { model: 'conceptos', key: 'id_concepto' }
      },
      monto: Sequelize.DECIMAL(10,2),
      descripcion: Sequelize.TEXT,
      estado: Sequelize.STRING(20),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('movimientos');
  }
};
