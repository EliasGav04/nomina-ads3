'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('usuarios', {
      id_usuario: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      usuario: Sequelize.STRING(50),
      clave_hash: Sequelize.STRING(255),
      id_rol: {
        type: Sequelize.INTEGER,
        references: { model: 'roles', key: 'id_rol' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      ultimo_acceso: Sequelize.DATE,
      estado: Sequelize.STRING(20),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};
