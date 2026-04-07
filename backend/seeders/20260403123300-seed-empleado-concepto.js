'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const fechaDesde = '2026-01-01';

    const baseAsignaciones = [
      { id_empleado: 1, id_concepto: 2, valor: 1200.00 },
      { id_empleado: 2, id_concepto: 2, valor: 1800.00 },
      { id_empleado: 3, id_concepto: 2, valor: 1400.00 },
      { id_empleado: 4, id_concepto: 2, valor: 1700.00 },
      { id_empleado: 5, id_concepto: 2, valor: 2600.00 },
      { id_empleado: 6, id_concepto: 2, valor: 1300.00 },
      { id_empleado: 7, id_concepto: 2, valor: 1100.00 },
      { id_empleado: 8, id_concepto: 2, valor: 1250.00 },
      { id_empleado: 9, id_concepto: 2, valor: 900.00 },
      { id_empleado: 10, id_concepto: 2, valor: 700.00 },
      { id_empleado: 11, id_concepto: 2, valor: 1900.00 },
      { id_empleado: 12, id_concepto: 2, valor: 1200.00 },
      { id_empleado: 13, id_concepto: 2, valor: 1300.00 },
      { id_empleado: 14, id_concepto: 2, valor: 650.00 },
      { id_empleado: 15, id_concepto: 2, valor: 2100.00 },
      { id_empleado: 16, id_concepto: 2, valor: 1000.00 },
      { id_empleado: 17, id_concepto: 2, valor: 600.00 },
      { id_empleado: 18, id_concepto: 2, valor: 650.00 },
      { id_empleado: 19, id_concepto: 2, valor: 3000.00 },
      { id_empleado: 20, id_concepto: 2, valor: 3400.00 },
      { id_empleado: 3, id_concepto: 3, valor: 7.50 },
      { id_empleado: 7, id_concepto: 3, valor: 6.25 },
      { id_empleado: 8, id_concepto: 3, valor: 7.00 },
      { id_empleado: 9, id_concepto: 3, valor: 5.75 },
      { id_empleado: 4, id_concepto: 9, valor: 600.00 },
      { id_empleado: 11, id_concepto: 9, valor: 850.00 },
      { id_empleado: 15, id_concepto: 9, valor: 900.00 },
      { id_empleado: 19, id_concepto: 9, valor: 1100.00 },
      { id_empleado: 1, id_concepto: 8, valor: 900.00 },
      { id_empleado: 5, id_concepto: 8, valor: 1500.00 },
      { id_empleado: 10, id_concepto: 8, valor: 650.00 },
      { id_empleado: 14, id_concepto: 8, valor: 400.00 },
      { id_empleado: 20, id_concepto: 8, valor: 1800.00 },
      { id_empleado: 2, id_concepto: 12, valor: 350.00 },
      { id_empleado: 6, id_concepto: 12, valor: 300.00 },
      { id_empleado: 13, id_concepto: 12, valor: 250.00 },
      { id_empleado: 16, id_concepto: 12, valor: 275.00 }
    ];

    const rows = baseAsignaciones.map((item, idx) => ({
      id_empleado_concepto: idx + 1,
      id_empleado: item.id_empleado,
      id_concepto: item.id_concepto,
      valor: item.valor,
      fecha_desde: fechaDesde,
      fecha_hasta: null,
      createdAt: now,
      updatedAt: now
    }));

    await queryInterface.bulkInsert('empleado_concepto', rows, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('empleado_concepto', null, {});
  }
};
