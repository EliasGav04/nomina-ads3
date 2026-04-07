'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('conceptos', [
      // Ingresos
      { id_concepto: 1, concepto: 'Bono transporte', tipo: 'ingreso', naturaleza: 'fijo', valor_defecto: 800.00, es_global: true, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 2, concepto: 'Bono productividad', tipo: 'ingreso', naturaleza: 'fijo', valor_defecto: 0.00, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 3, concepto: 'Comisión por ventas', tipo: 'ingreso', naturaleza: 'porcentaje', valor_defecto: 0.00, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 4, concepto: 'Horas extra', tipo: 'ingreso', naturaleza: 'manual', valor_defecto: 0.00, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 9, concepto: 'Bono antiguedad', tipo: 'ingreso', naturaleza: 'fijo', valor_defecto: 0.00, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 10, concepto: 'Bono nocturno', tipo: 'ingreso', naturaleza: 'manual', valor_defecto: 0.00, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },

      // Deducciones
      { id_concepto: 5, concepto: 'Aporte IHSS empleado', tipo: 'deduccion', naturaleza: 'porcentaje', valor_defecto: 5.00, es_global: true, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 6, concepto: 'Aporte RAP empleado', tipo: 'deduccion', naturaleza: 'porcentaje', valor_defecto: 1.50, es_global: true, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 7, concepto: 'ISR mensual', tipo: 'deduccion', naturaleza: 'manual', valor_defecto: 0.00, es_global: true, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 8, concepto: 'Prestamo personal', tipo: 'deduccion', naturaleza: 'fijo', valor_defecto: 0.00, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 11, concepto: 'Adelanto salarial', tipo: 'deduccion', naturaleza: 'manual', valor_defecto: 0.00, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 12, concepto: 'Aporte cooperativa', tipo: 'deduccion', naturaleza: 'fijo', valor_defecto: 0.00, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('conceptos', { id_concepto: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, {});
  }
};
