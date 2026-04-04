'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('empleados', {
      id_empleado: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      dni: Sequelize.STRING(20),
      nombre_completo: Sequelize.STRING(255),
      cargo: Sequelize.STRING(100),
      fecha_ingreso: Sequelize.DATEONLY,
      id_area: {
        type: Sequelize.INTEGER,
        references: { model: 'areas', key: 'id_area' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      numero_ihss: Sequelize.STRING(30),
      cta_bancaria: Sequelize.STRING(40),
      salario_base: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      estado: Sequelize.STRING(20),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('empleados');
  }
};
