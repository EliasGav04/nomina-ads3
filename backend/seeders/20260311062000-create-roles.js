'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        id_rol: 1,
        rol: 'Administrador'
      },
      {
        id_rol: 2,
        rol: 'RRHH'
      },
      {
        id_rol: 3,
        rol: 'Consultor'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
