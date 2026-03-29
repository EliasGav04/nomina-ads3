'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const adminHash = await bcrypt.hash('admin123', 10);
    const rrhhHash = await bcrypt.hash('recursos123', 10);
    const consultorHash = await bcrypt.hash('consultor123', 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        usuario: 'admin',
        clave_hash: adminHash,
        id_rol: 1,
        ultimo_acceso: null,
        estado: 'Activo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        usuario: 'recursos1',
        clave_hash: rrhhHash,
        id_rol: 2,
        ultimo_acceso: null,
        estado: 'Activo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        usuario: 'consultor1',
        clave_hash: consultorHash,
        id_rol: 3,
        ultimo_acceso: null,
        estado: 'Activo',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      usuario: ['admin', 'recursos1', 'consultor1']
    }, {});
  }
};