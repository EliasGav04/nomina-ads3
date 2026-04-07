'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('conceptos', [
      //ingresos
      { id_concepto: 1, concepto: 'Bono transporte', tipo: 'ingreso', naturaleza: 'fijo', regla_calculo: 'normal', tramos_json: null, valor_defecto: 800.00, aplica_tope: false, tope_monto: null, es_global: true, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 2, concepto: 'Bono productividad', tipo: 'ingreso', naturaleza: 'fijo', regla_calculo: 'normal', tramos_json: null, valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 3, concepto: 'Comisión por ventas', tipo: 'ingreso', naturaleza: 'porcentaje', regla_calculo: 'normal', tramos_json: null, valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 4, concepto: 'Horas extra', tipo: 'ingreso', naturaleza: 'manual', regla_calculo: 'normal', tramos_json: null, valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 9, concepto: 'Bono antiguedad', tipo: 'ingreso', naturaleza: 'fijo', regla_calculo: 'normal', tramos_json: null, valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 10, concepto: 'Bono nocturno', tipo: 'ingreso', naturaleza: 'manual', regla_calculo: 'normal', tramos_json: null, valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },

      //deducciones
      { id_concepto: 5, concepto: 'Aporte IHSS empleado', tipo: 'deduccion', naturaleza: 'porcentaje', regla_calculo: 'normal', tramos_json: null, valor_defecto: 5.00, aplica_tope: true, tope_monto: 11903.13, es_global: true, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 6, concepto: 'Aporte RAP empleado', tipo: 'deduccion', naturaleza: 'porcentaje', regla_calculo: 'normal', tramos_json: null, valor_defecto: 1.50, aplica_tope: false, tope_monto: null, es_global: true, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 7, concepto: 'ISR mensual', tipo: 'deduccion', naturaleza: 'manual', regla_calculo: 'tramos', tramos_json: '[{\"desde\":0.01,\"hasta\":22360.36,\"tasa\":0},{\"desde\":22360.37,\"hasta\":32346.18,\"tasa\":15},{\"desde\":32346.19,\"hasta\":70805.06,\"tasa\":20},{\"desde\":70805.07,\"hasta\":null,\"tasa\":25}]', valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: true, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 8, concepto: 'Prestamo personal', tipo: 'deduccion', naturaleza: 'fijo', regla_calculo: 'normal', tramos_json: null, valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 11, concepto: 'Adelanto salarial', tipo: 'deduccion', naturaleza: 'manual', regla_calculo: 'normal', tramos_json: null, valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_concepto: 12, concepto: 'Aporte cooperativa', tipo: 'deduccion', naturaleza: 'fijo', regla_calculo: 'normal', tramos_json: null, valor_defecto: 0.00, aplica_tope: false, tope_monto: null, es_global: false, estado: 'Activo', createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('conceptos', { id_concepto: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, {});
  }
};
