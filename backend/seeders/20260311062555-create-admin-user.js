'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hash = await bcrypt.hash('admin123', 10); 

    await queryInterface.bulkInsert('usuarios', [{
      usuario: 'admin',
      clave_hash: hash,
      id_rol: 1, // rol administrador
      ultimo_acceso: null,
      estado: 'Activo',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { usuario: 'admin' }, {});
  }
};
