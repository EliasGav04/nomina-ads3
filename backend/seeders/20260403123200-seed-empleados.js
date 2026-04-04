'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('empleados', [
      {
        id_empleado: 1,
        dni: '0801-1990-00011',
        nombre_completo: 'Juan Carlos Martinez',
        cargo: 'Auxiliar Contable',
        fecha_ingreso: '2023-01-10',
        id_area: 2,
        numero_ihss: 'IHSS-100011',
        cta_bancaria: '0101001100110011',
        salario_base: 18000.00,
        estado: 'Activo',
        createdAt: now,
        updatedAt: now
      },
      {
        id_empleado: 2,
        dni: '0801-1994-00022',
        nombre_completo: 'Maria Fernanda Lopez',
        cargo: 'Analista de RRHH',
        fecha_ingreso: '2022-07-04',
        id_area: 1,
        numero_ihss: 'IHSS-100022',
        cta_bancaria: '0101002200220022',
        salario_base: 22000.00,
        estado: 'Activo',
        createdAt: now,
        updatedAt: now
      },
      {
        id_empleado: 3,
        dni: '0801-1988-00033',
        nombre_completo: 'Luis Alberto Castillo',
        cargo: 'Vendedor Senior',
        fecha_ingreso: '2021-03-15',
        id_area: 3,
        numero_ihss: 'IHSS-100033',
        cta_bancaria: '0101003300330033',
        salario_base: 16000.00,
        estado: 'Activo',
        createdAt: now,
        updatedAt: now
      },
      {
        id_empleado: 4,
        dni: '0801-1992-00044',
        nombre_completo: 'Sofia Daniela Pineda',
        cargo: 'Supervisora de Operaciones',
        fecha_ingreso: '2020-11-01',
        id_area: 4,
        numero_ihss: 'IHSS-100044',
        cta_bancaria: '0101004400440044',
        salario_base: 26000.00,
        estado: 'Activo',
        createdAt: now,
        updatedAt: now
      },
      {
        id_empleado: 5,
        dni: '0801-1996-00055',
        nombre_completo: 'Kevin Josue Hernandez',
        cargo: 'Desarrollador Full Stack',
        fecha_ingreso: '2024-02-19',
        id_area: 5,
        numero_ihss: 'IHSS-100055',
        cta_bancaria: '0101005500550055',
        salario_base: 32000.00,
        estado: 'Activo',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('empleados', { id_empleado: [1, 2, 3, 4, 5] }, {});
  }
};
