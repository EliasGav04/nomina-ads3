'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('areas', [
      { id_area: 1, area: 'Recursos Humanos', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_area: 2, area: 'Contabilidad', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_area: 3, area: 'Ventas', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_area: 4, area: 'Operaciones', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_area: 5, area: 'Tecnologia', estado: 'Activo', createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('areas', { id_area: [1, 2, 3, 4, 5] }, {});
  }
};
