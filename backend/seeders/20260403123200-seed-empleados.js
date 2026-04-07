'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('empleados', [
      { id_empleado: 1, dni: '0801199000001', nombre_completo: 'Juan Carlos Martinez', cargo: 'Auxiliar Contable', fecha_ingreso: '2021-01-10', id_area: 2, numero_ihss: '0801199000001', cta_bancaria: '0101202600010001', salario_base: 18500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 2, dni: '0801199000002', nombre_completo: 'Maria Fernanda Lopez', cargo: 'Analista de Recursos Humanos', fecha_ingreso: '2020-07-04', id_area: 1, numero_ihss: '0801199000002', cta_bancaria: '0101202600010002', salario_base: 24000.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 3, dni: '0801199000003', nombre_completo: 'Luis Alberto Castillo', cargo: 'Vendedor Senior', fecha_ingreso: '2019-03-15', id_area: 3, numero_ihss: '0801199000003', cta_bancaria: '0101202600010003', salario_base: 21000.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 4, dni: '0801199000004', nombre_completo: 'Sofia Daniela Pineda', cargo: 'Supervisora de Operaciones', fecha_ingreso: '2018-11-01', id_area: 4, numero_ihss: '0801199000004', cta_bancaria: '0101202600010004', salario_base: 28500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 5, dni: '0801199000005', nombre_completo: 'Kevin Josue Hernandez', cargo: 'Desarrollador Full Stack', fecha_ingreso: '2022-02-19', id_area: 5, numero_ihss: '0801199000005', cta_bancaria: '0101202600010005', salario_base: 36000.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 6, dni: '0801199000006', nombre_completo: 'Daniel Orlando Cruz', cargo: 'Coordinador de Logistica', fecha_ingreso: '2020-06-22', id_area: 6, numero_ihss: '0801199000006', cta_bancaria: '0101202600010006', salario_base: 23000.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 7, dni: '0801199000007', nombre_completo: 'Karen Gabriela Mejia', cargo: 'Asesora Comercial', fecha_ingreso: '2021-09-05', id_area: 3, numero_ihss: '0801199000007', cta_bancaria: '0101202600010007', salario_base: 17500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 8, dni: '0801199000008', nombre_completo: 'Jorge Armando Flores', cargo: 'Asesor Comercial', fecha_ingreso: '2019-08-13', id_area: 3, numero_ihss: '0801199000008', cta_bancaria: '0101202600010008', salario_base: 19500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 9, dni: '0801199000009', nombre_completo: 'Ana Lucia Caceres', cargo: 'Ejecutiva de Ventas', fecha_ingreso: '2023-01-03', id_area: 3, numero_ihss: '0801199000009', cta_bancaria: '0101202600010009', salario_base: 16800.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 10, dni: '0801199000010', nombre_completo: 'Rene Alberto Molina', cargo: 'Asistente de Compras', fecha_ingreso: '2022-04-17', id_area: 8, numero_ihss: '0801199000010', cta_bancaria: '0101202600010010', salario_base: 16500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 11, dni: '0801199000011', nombre_completo: 'Paola Milena Ochoa', cargo: 'Jefe de Compras', fecha_ingreso: '2017-10-25', id_area: 8, numero_ihss: '0801199000011', cta_bancaria: '0101202600010011', salario_base: 29500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 12, dni: '0801199000012', nombre_completo: 'Carlos Emilio Banegas', cargo: 'Oficial de Soporte Tecnico', fecha_ingreso: '2021-05-07', id_area: 5, numero_ihss: '0801199000012', cta_bancaria: '0101202600010012', salario_base: 20500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 13, dni: '0801199000013', nombre_completo: 'Nadia Alejandra Ramos', cargo: 'Analista Contabilidad', fecha_ingreso: '2020-02-11', id_area: 2, numero_ihss: '0801199000013', cta_bancaria: '0101202600010013', salario_base: 22500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 14, dni: '0801199000014', nombre_completo: 'Oscar Geovanny Funez', cargo: 'Cajero General', fecha_ingreso: '2023-06-01', id_area: 2, numero_ihss: '0801199000014', cta_bancaria: '0101202600010014', salario_base: 14500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 15, dni: '0801199000015', nombre_completo: 'Miriam Elena Zelaya', cargo: 'Coordinador de Recursos Humanos', fecha_ingreso: '2018-03-20', id_area: 1, numero_ihss: '0801199000015', cta_bancaria: '0101202600010015', salario_base: 27500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 16, dni: '0801199000016', nombre_completo: 'Pedro Jose Aguilar', cargo: 'Supervisor de Bodega', fecha_ingreso: '2019-07-29', id_area: 6, numero_ihss: '0801199000016', cta_bancaria: '0101202600010016', salario_base: 21500.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 17, dni: '0801199000017', nombre_completo: 'Yadira Patricia Murillo', cargo: 'Agente de Servicio al Cliente', fecha_ingreso: '2022-11-12', id_area: 7, numero_ihss: '0801199000017', cta_bancaria: '0101202600010017', salario_base: 15800.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 18, dni: '0801199000018', nombre_completo: 'Victor Manuel Moncada', cargo: 'Agente de Servicio al Cliente', fecha_ingreso: '2021-12-09', id_area: 7, numero_ihss: '0801199000018', cta_bancaria: '0101202600010018', salario_base: 16200.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 19, dni: '0801199000019', nombre_completo: 'Jose Adan Padilla', cargo: 'Gerente de Operaciones', fecha_ingreso: '2017-04-14', id_area: 4, numero_ihss: '0801199000019', cta_bancaria: '0101202600010019', salario_base: 42000.00, estado: 'Activo', createdAt: now, updatedAt: now },
      { id_empleado: 20, dni: '0801199000020', nombre_completo: 'Lester Enrique Paz', cargo: 'Gerente de IT', fecha_ingreso: '2019-09-30', id_area: 5, numero_ihss: '0801199000020', cta_bancaria: '0101202600010020', salario_base: 48000.00, estado: 'Activo', createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('empleados', {
      id_empleado: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    }, {});
  }
};
