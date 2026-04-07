'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('movimientos', [
      //enero 2026 cerrado
      { id_movimiento: 1, id_periodo: 1, id_empleado: 1, id_concepto: 4, monto: 500.00, descripcion: 'Horas extra cierre contable enero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 2, id_periodo: 1, id_empleado: 3, id_concepto: 4, monto: 650.00, descripcion: 'Horas extra apoyo ventas enero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 3, id_periodo: 1, id_empleado: 7, id_concepto: 4, monto: 250.00, descripcion: 'Horas extra ruta comercial enero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 4, id_periodo: 1, id_empleado: 19, id_concepto: 4, monto: 800.00, descripcion: 'Horas extra supervision operativa enero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 5, id_periodo: 1, id_empleado: 5, id_concepto: 10, monto: 700.00, descripcion: 'Bono nocturno soporte enero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 6, id_periodo: 1, id_empleado: 16, id_concepto: 10, monto: 400.00, descripcion: 'Bono nocturno inventario enero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 9, id_periodo: 1, id_empleado: 14, id_concepto: 11, monto: 350.00, descripcion: 'Adelanto salario enero', estado: 'Activo', createdAt: now, updatedAt: now },

      //febrero 2026 cerrado
      { id_movimiento: 10, id_periodo: 2, id_empleado: 2, id_concepto: 4, monto: 320.00, descripcion: 'Horas extra cierre contrataciones febrero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 11, id_periodo: 2, id_empleado: 3, id_concepto: 4, monto: 700.00, descripcion: 'Horas extra apoyo ventas febrero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 12, id_periodo: 2, id_empleado: 9, id_concepto: 4, monto: 300.00, descripcion: 'Horas extra atencion mayorista febrero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 13, id_periodo: 2, id_empleado: 11, id_concepto: 4, monto: 280.00, descripcion: 'Horas extra cierre compras febrero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 14, id_periodo: 2, id_empleado: 4, id_concepto: 10, monto: 650.00, descripcion: 'Bono nocturno turno especial febrero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 15, id_periodo: 2, id_empleado: 5, id_concepto: 10, monto: 900.00, descripcion: 'Bono nocturno soporte febrero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 16, id_periodo: 2, id_empleado: 16, id_concepto: 10, monto: 520.00, descripcion: 'Bono nocturno inventario febrero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 19, id_periodo: 2, id_empleado: 14, id_concepto: 11, monto: 500.00, descripcion: 'Adelanto salario febrero', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 20, id_periodo: 2, id_empleado: 18, id_concepto: 11, monto: 400.00, descripcion: 'Adelanto salario emergencia febrero', estado: 'Activo', createdAt: now, updatedAt: now },

      //marzo 2026 abierto pruebas
      { id_movimiento: 21, id_periodo: 3, id_empleado: 1, id_concepto: 4, monto: 700.00, descripcion: 'Horas extra cierre contable marzo', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 22, id_periodo: 3, id_empleado: 3, id_concepto: 4, monto: 950.00, descripcion: 'Horas extra por apoyo feria ventas', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 23, id_periodo: 3, id_empleado: 4, id_concepto: 10, monto: 650.00, descripcion: 'Bono nocturno por turno especial', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 24, id_periodo: 3, id_empleado: 5, id_concepto: 10, monto: 900.00, descripcion: 'Bono nocturno soporte implementacion', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 25, id_periodo: 3, id_empleado: 7, id_concepto: 4, monto: 400.00, descripcion: 'Horas extra cierre ruta comercial', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 26, id_periodo: 3, id_empleado: 9, id_concepto: 4, monto: 350.00, descripcion: 'Horas extra atencion cliente mayorista', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 28, id_periodo: 3, id_empleado: 14, id_concepto: 11, monto: 500.00, descripcion: 'Adelanto salario solicitado en marzo', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 29, id_periodo: 3, id_empleado: 18, id_concepto: 11, monto: 400.00, descripcion: 'Adelanto salario por emergencia familiar', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 31, id_periodo: 3, id_empleado: 2, id_concepto: 4, monto: 320.00, descripcion: 'Horas extra cierre proceso contratacion', estado: 'Activo', createdAt: now, updatedAt: now },
      { id_movimiento: 32, id_periodo: 3, id_empleado: 16, id_concepto: 10, monto: 520.00, descripcion: 'Bono nocturno inventario general', estado: 'Activo', createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('movimientos', {
      id_movimiento: [
        1, 2, 3, 4, 5, 6, 9,
        10, 11, 12, 13, 14, 15, 16, 19, 20,
        21, 22, 23, 24, 25, 26, 28, 29, 31, 32
      ]
    }, {});
  }
};
