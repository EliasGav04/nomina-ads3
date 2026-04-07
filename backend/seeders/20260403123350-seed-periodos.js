'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('periodos', [
      {
        id_periodo: 1,
        periodo: 'Enero 2026',
        fecha_inicio: '2026-01-01',
        fecha_final: '2026-01-31',
        fecha_pago: '2026-02-05',
        estado: 'Cerrado',
        createdAt: now,
        updatedAt: now
      },
      {
        id_periodo: 2,
        periodo: 'Febrero 2026',
        fecha_inicio: '2026-02-01',
        fecha_final: '2026-02-28',
        fecha_pago: '2026-03-05',
        estado: 'Cerrado',
        createdAt: now,
        updatedAt: now
      },
      {
        id_periodo: 3,
        periodo: 'Marzo 2026',
        fecha_inicio: '2026-03-01',
        fecha_final: '2026-03-31',
        fecha_pago: '2026-04-05',
        estado: 'Abierto',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('periodos', { id_periodo: [1, 2, 3] }, {});
  }
};

