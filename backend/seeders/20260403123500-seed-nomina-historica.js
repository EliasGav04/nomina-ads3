'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const round2 = (n) => Number((Number(n) || 0).toFixed(2));
    const [empresaRows] = await queryInterface.sequelize.query(
      'SELECT tope_segurosocial_empleado FROM infoempresa WHERE id_empresa = 1 LIMIT 1'
    );
    const topeSeguroSocialEmpleado = Number(
      empresaRows?.[0]?.tope_segurosocial_empleado ?? 11903.13
    );

    const salariosBase = {
      1: 18500, 2: 24000, 3: 21000, 4: 28500, 5: 36000,
      6: 23000, 7: 17500, 8: 19500, 9: 16800, 10: 16500,
      11: 29500, 12: 20500, 13: 22500, 14: 14500, 15: 27500,
      16: 21500, 17: 15800, 18: 16200, 19: 42000, 20: 48000
    };

    const bonoProductividad = {
      1: 1200, 2: 1800, 3: 1400, 4: 1700, 5: 2600, 6: 1300, 7: 1100, 8: 1250, 9: 900, 10: 700,
      11: 1900, 12: 1200, 13: 1300, 14: 650, 15: 2100, 16: 1000, 17: 600, 18: 650, 19: 3000, 20: 3400
    };

    const comisionPct = { 3: 7.5, 7: 6.25, 8: 7.0, 9: 5.75 };
    const bonoAntiguedad = { 4: 600, 11: 850, 15: 900, 19: 1100 };
    const prestamoPersonal = { 1: 900, 5: 1500, 10: 650, 14: 400, 20: 1800 };
    const aporteCooperativa = { 2: 350, 6: 300, 13: 250, 16: 275 };

    const ingresosManualesPorPeriodo = {
      1: {
        4: { 1: 500, 3: 650, 7: 250, 19: 800 },      // Horas extra
        10: { 5: 700, 16: 400 }                       // Bono nocturno
      },
      2: {
        4: { 2: 320, 3: 700, 9: 300, 11: 280 },      // Horas extra
        10: { 4: 650, 5: 900, 16: 520 }               // Bono nocturno
      }
    };

    const deduccionesManualesPorPeriodo = {
      1: {
        7: { 11: 850, 19: 1200 },                    // Isr mensual
        11: { 14: 350 }                               // Adelanto salario
      },
      2: {
        7: { 11: 850, 19: 1500 },
        11: { 14: 500, 18: 400 }
      }
    };

    const periodos = [
      { id: 1, fechaPago: new Date('2026-02-05T12:00:00Z') },
      { id: 2, fechaPago: new Date('2026-03-05T12:00:00Z') }
    ];

    const registros = [];
    const detalles = [];
    let idRegistro = 1;
    let idDetalle = 1;

    for (const periodo of periodos) {
      for (let idEmpleado = 1; idEmpleado <= 20; idEmpleado++) {
        const salario = round2(salariosBase[idEmpleado]);
        const detalleIngreso = {
          1: 800.00,
          2: round2(bonoProductividad[idEmpleado] || 0),
          9: round2(bonoAntiguedad[idEmpleado] || 0),
          3: round2(salario * ((comisionPct[idEmpleado] || 0) / 100)),
          4: round2(ingresosManualesPorPeriodo[periodo.id]?.[4]?.[idEmpleado] || 0),
          10: round2(ingresosManualesPorPeriodo[periodo.id]?.[10]?.[idEmpleado] || 0)
        };

        const detalleDeduccion = {
          5: round2(Math.min(salario, topeSeguroSocialEmpleado) * 0.05),
          6: round2(salario * 0.015),
          8: round2(prestamoPersonal[idEmpleado] || 0),
          12: round2(aporteCooperativa[idEmpleado] || 0),
          7: round2(deduccionesManualesPorPeriodo[periodo.id]?.[7]?.[idEmpleado] || 0),
          11: round2(deduccionesManualesPorPeriodo[periodo.id]?.[11]?.[idEmpleado] || 0)
        };

        const salarioBruto = round2(Object.values(detalleIngreso).reduce((a, b) => a + b, salario));
        const totalDeducciones = round2(Object.values(detalleDeduccion).reduce((a, b) => a + b, 0));
        const salarioNeto = round2(salarioBruto - totalDeducciones);

        registros.push({
          id_registro: idRegistro,
          id_periodo: periodo.id,
          id_empleado: idEmpleado,
          salario_bruto: salarioBruto,
          total_deducciones: totalDeducciones,
          salario_neto: salarioNeto,
          createdAt: periodo.fechaPago,
          updatedAt: periodo.fechaPago
        });

        for (const [idConcepto, monto] of Object.entries(detalleIngreso)) {
          if (monto > 0) {
            detalles.push({
              id_detalle: idDetalle++,
              id_registro: idRegistro,
              id_concepto: Number(idConcepto),
              monto: round2(monto),
              createdAt: periodo.fechaPago
            });
          }
        }

        for (const [idConcepto, monto] of Object.entries(detalleDeduccion)) {
          if (monto > 0) {
            detalles.push({
              id_detalle: idDetalle++,
              id_registro: idRegistro,
              id_concepto: Number(idConcepto),
              monto: round2(monto),
              createdAt: periodo.fechaPago
            });
          }
        }

        idRegistro++;
      }
    }

    await queryInterface.bulkInsert('nomina_registros', registros, {});
    await queryInterface.bulkInsert('nomina_detalles', detalles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE nd
      FROM nomina_detalles nd
      INNER JOIN nomina_registros nr ON nr.id_registro = nd.id_registro
      WHERE nr.id_periodo IN (1, 2)
    `);

    await queryInterface.bulkDelete('nomina_registros', { id_periodo: [1, 2] }, {});
  }
};

