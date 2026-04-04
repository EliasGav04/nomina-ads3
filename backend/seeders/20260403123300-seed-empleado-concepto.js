'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('empleado_concepto', [
      // Juan (Contabilidad)
      {
        id_empleado_concepto: 1,
        id_empleado: 1,
        id_concepto: 2,
        valor: 1200.00,
        fecha_desde: '2026-01-01',
        fecha_hasta: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id_empleado_concepto: 2,
        id_empleado: 1,
        id_concepto: 8,
        valor: 900.00,
        fecha_desde: '2026-01-01',
        fecha_hasta: null,
        createdAt: now,
        updatedAt: now
      },

      // Maria (RRHH)
      {
        id_empleado_concepto: 3,
        id_empleado: 2,
        id_concepto: 2,
        valor: 1500.00,
        fecha_desde: '2026-01-01',
        fecha_hasta: null,
        createdAt: now,
        updatedAt: now
      },

      // Luis (Ventas)
      {
        id_empleado_concepto: 4,
        id_empleado: 3,
        id_concepto: 3,
        valor: 8.00,
        fecha_desde: '2026-01-01',
        fecha_hasta: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id_empleado_concepto: 5,
        id_empleado: 3,
        id_concepto: 2,
        valor: 1000.00,
        fecha_desde: '2026-01-01',
        fecha_hasta: null,
        createdAt: now,
        updatedAt: now
      },

      // Sofia (Operaciones)
      {
        id_empleado_concepto: 6,
        id_empleado: 4,
        id_concepto: 2,
        valor: 1800.00,
        fecha_desde: '2026-01-01',
        fecha_hasta: null,
        createdAt: now,
        updatedAt: now
      },

      // Kevin (Tecnologia)
      {
        id_empleado_concepto: 7,
        id_empleado: 5,
        id_concepto: 2,
        valor: 2500.00,
        fecha_desde: '2026-01-01',
        fecha_hasta: null,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('empleado_concepto', { id_empleado_concepto: [1, 2, 3, 4, 5, 6, 7] }, {});
  }
};
