'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('nomina_registros', {
      id_registro: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      id_periodo: {
        type: Sequelize.INTEGER,
        references: { model: 'periodos', key: 'id_periodo' }
      },
      id_empleado: {
        type: Sequelize.INTEGER,
        references: { model: 'empleados', key: 'id_empleado' }
      },
      salario_bruto: Sequelize.DECIMAL(10,2),
      total_deducciones: Sequelize.DECIMAL(10,2),
      salario_neto: Sequelize.DECIMAL(10,2),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('nomina_registros');
  }
};
