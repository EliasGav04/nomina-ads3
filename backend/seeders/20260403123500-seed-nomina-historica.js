'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const round2 = (n) => Number((Number(n) || 0).toFixed(2));
    const calcularProgresivo = (base, tramos) => {
      if (!Number.isFinite(base) || base <= 0 || !Array.isArray(tramos) || !tramos.length) return 0;
      const ordenados = tramos
        .map((t) => ({
          desde: Number(t?.desde),
          hasta: t?.hasta === null || t?.hasta === undefined || t?.hasta === '' ? null : Number(t?.hasta),
          tasa: Number(t?.tasa)
        }))
        .filter((t) => Number.isFinite(t.desde) && Number.isFinite(t.tasa) && t.tasa >= 0 && t.tasa <= 100)
        .sort((a, b) => a.desde - b.desde);

      let impuesto = 0;
      for (const tramo of ordenados) {
        if (base <= tramo.desde) continue;
        const limiteSuperior = tramo.hasta === null ? base : Math.min(base, tramo.hasta);
        const baseTramo = Math.max(0, limiteSuperior - tramo.desde);
        if (baseTramo > 0) impuesto += baseTramo * (tramo.tasa / 100);
        if (tramo.hasta !== null && base <= tramo.hasta) break;
      }

      return round2(impuesto);
    };

    const [seguroSocialRows] = await queryInterface.sequelize.query(`
      SELECT valor_defecto, aplica_tope, tope_monto
      FROM conceptos
      WHERE id_concepto = 5
      LIMIT 1
    `);
    const conceptoSeguroSocial = seguroSocialRows?.[0];
    const porcentajeSeguroSocial = Number(conceptoSeguroSocial?.valor_defecto);
    const aplicaTopeSeguroSocial = Boolean(conceptoSeguroSocial?.aplica_tope);
    const topeSeguroSocial = Number(conceptoSeguroSocial?.tope_monto);

    if (!Number.isFinite(porcentajeSeguroSocial) || porcentajeSeguroSocial < 0) {
      throw new Error('El porcentaje del concepto de seguro social empleado es inválido.');
    }
    if (aplicaTopeSeguroSocial && (!Number.isFinite(topeSeguroSocial) || topeSeguroSocial <= 0)) {
      throw new Error('El tope del concepto de seguro social empleado es inválido.');
    }

    const [isrRows] = await queryInterface.sequelize.query(`
      SELECT regla_calculo, tramos_json
      FROM conceptos
      WHERE id_concepto = 7
      LIMIT 1
    `);
    const conceptoIsr = isrRows?.[0];
    const reglaIsr = String(conceptoIsr?.regla_calculo || '').toLowerCase();
    const tramosIsr = reglaIsr === 'tramos' ? JSON.parse(conceptoIsr?.tramos_json || '[]') : [];

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
        4: { 1: 500, 3: 650, 7: 250, 19: 800 },      //horas extra
        10: { 5: 700, 16: 400 }                       //bono nocturno
      },
      2: {
        4: { 2: 320, 3: 700, 9: 300, 11: 280 },      //horas extra
        10: { 4: 650, 5: 900, 16: 520 }               //bono nocturno
      }
    };

    const deduccionesManualesPorPeriodo = {
      1: {
        11: { 14: 350 }                               //adelanto salario
      },
      2: {
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

        const salarioBruto = round2(Object.values(detalleIngreso).reduce((a, b) => a + b, salario));
        const isrCalculado = reglaIsr === 'tramos' ? calcularProgresivo(salarioBruto, tramosIsr) : 0;

        const detalleDeduccion = {
          5: round2((aplicaTopeSeguroSocial ? Math.min(salario, topeSeguroSocial) : salario) * (porcentajeSeguroSocial / 100)),
          6: round2(salario * 0.015),
          8: round2(prestamoPersonal[idEmpleado] || 0),
          12: round2(aporteCooperativa[idEmpleado] || 0),
          7: round2(isrCalculado),
          11: round2(deduccionesManualesPorPeriodo[periodo.id]?.[11]?.[idEmpleado] || 0)
        };

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

