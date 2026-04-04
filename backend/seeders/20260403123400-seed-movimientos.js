'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const periodos = await queryInterface.sequelize.query(
      "SELECT id_periodo FROM periodos WHERE estado = 'Abierto' ORDER BY fecha_inicio ASC LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );
    let idPeriodo = periodos.length ? periodos[0].id_periodo : null;
    const now = new Date();

    // Para entorno fresh, crear período base si aún no existe uno abierto
    if (!idPeriodo) {
      await queryInterface.bulkInsert('periodos', [{
        id_periodo: 1,
        periodo: 'Febrero 2026',
        fecha_inicio: '2026-02-01',
        fecha_final: '2026-02-28',
        fecha_pago: '2026-03-05',
        estado: 'Abierto',
        createdAt: now,
        updatedAt: now
      }], {});
      idPeriodo = 1;
    }

    await queryInterface.bulkInsert('movimientos', [
      {
        id_movimiento: 1,
        id_periodo: idPeriodo,
        id_empleado: 1,
        id_concepto: 4,
        monto: 950.00,
        descripcion: 'Horas extra de cierre contable',
        estado: 'Activo',
        createdAt: now,
        updatedAt: now
      },
      {
        id_movimiento: 2,
        id_periodo: idPeriodo,
        id_empleado: 3,
        id_concepto: 4,
        monto: 600.00,
        descripcion: 'Horas extra por jornada de inventario',
        estado: 'Activo',
        createdAt: now,
        updatedAt: now
      },
      {
        id_movimiento: 3,
        id_periodo: idPeriodo,
        id_empleado: 4,
        id_concepto: 7,
        monto: 1200.00,
        descripcion: 'Ajuste ISR mensual',
        estado: 'Activo',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('movimientos', {
      id_movimiento: [1, 2, 3],
      descripcion: [
        'Horas extra de cierre contable',
        'Horas extra por jornada de inventario',
        'Ajuste ISR mensual'
      ]
    }, {});

    await queryInterface.bulkDelete('periodos', { id_periodo: 1, periodo: 'Febrero 2026' }, {});
  }
};
