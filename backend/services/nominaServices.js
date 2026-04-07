//servicio nomina
const { Op } = require('sequelize');
const { sequelize, Periodo, Empleado, Concepto, EmpleadoConcepto, Movimiento, NominaRegistro, NominaDetalle } = require('../models');

function salarioBaseNumerico(empleado) {
  const n = parseFloat(empleado.salario_base);
  return Number.isFinite(n) ? n : NaN;
}

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function parseTramos(concepto) {
  if (!concepto?.tramos_json) return [];
  try {
    const parsed = JSON.parse(String(concepto.tramos_json));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function calcularProgresivo(base, tramos) {
  if (!Number.isFinite(base) || base <= 0 || !Array.isArray(tramos) || !tramos.length) {
    return 0;
  }

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
    if (baseTramo > 0) {
      impuesto += baseTramo * (tramo.tasa / 100);
    }
    if (tramo.hasta !== null && base <= tramo.hasta) break;
  }

  return round2(impuesto);
}

function validarMontoCalculado(monto, empleado, concepto, origen) {
  if (!Number.isFinite(monto)) {
    throw new Error(
      `Monto inválido en ${origen} para el empleado "${empleado.nombre_completo}" y concepto "${concepto.concepto}".`
    );
  }
  if (monto < 0) {
    throw new Error(
      `Monto negativo no permitido en ${origen} para el empleado "${empleado.nombre_completo}" y concepto "${concepto.concepto}".`
    );
  }
  return round2(monto);
}

//calcular monto segun naturaleza concepto
function calcularMonto(concepto, empleado, asignacion = null, options = {}) {
  const base = salarioBaseNumerico(empleado);
  const reglaCalculo = String(concepto?.regla_calculo || 'normal').toLowerCase();

  if (reglaCalculo === 'tramos') {
    const baseGravable = Number(options?.baseGravable);
    const baseReferencia = Number.isFinite(baseGravable) ? baseGravable : base;
    return calcularProgresivo(baseReferencia, parseTramos(concepto));
  }

  switch (concepto.naturaleza) {
    case 'fijo':
      return asignacion ? parseFloat(asignacion.valor) : parseFloat(concepto.valor_defecto);

    case 'porcentaje': {
      const porcentaje = asignacion ? parseFloat(asignacion.valor) : parseFloat(concepto.valor_defecto);
      const aplicaTope = Boolean(concepto?.aplica_tope);
      const topeMonto = Number(concepto?.tope_monto);
      const baseCalculo = aplicaTope && Number.isFinite(topeMonto) && topeMonto > 0
        ? Math.min(base, topeMonto)
        : base;
      return (baseCalculo * porcentaje) / 100;
    }

    case 'manual':
      return 0;

    default:
      return 0;
  }
}

//ejecutar nomina periodo
async function ejecutarNomina(periodoId) {
  return sequelize.transaction(async (t) => {
    const periodo = await Periodo.findByPk(periodoId, { transaction: t });
    if (!periodo || periodo.estado !== 'Abierto') {
      throw new Error('Período inválido o ya procesado');
    }
    if (!periodo.fecha_inicio || !periodo.fecha_final) {
      throw new Error('El período requiere fecha_inicio y fecha_final para procesar nómina');
    }

    const registrosExistentes = await NominaRegistro.count({
      where: { id_periodo: periodoId },
      transaction: t
    });
    if (registrosExistentes > 0) {
      throw new Error('El período ya tiene registros de nómina y no puede reprocesarse.');
    }

    const empleados = await Empleado.findAll({ where: { estado: 'Activo' }, transaction: t });
    if (!empleados.length) {
      throw new Error('No hay empleados activos para procesar en nómina.');
    }
    const ini = periodo.fecha_inicio;
    const fin = periodo.fecha_final;

    for (const empleado of empleados) {
      const base = salarioBaseNumerico(empleado);
      if (!Number.isFinite(base) || base <= 0) {
        throw new Error(`El empleado "${empleado.nombre_completo}" tiene salario base inválido. Verifique su ficha antes de procesar nómina.`);
      }

      //asignaciones vigentes al cierre periodo
      const asignaciones = await EmpleadoConcepto.findAll({
        where: {
          id_empleado: empleado.id_empleado,
          [Op.and]: [
            { fecha_desde: { [Op.lte]: fin } },
            {
              [Op.or]: [
                { fecha_hasta: null },
                { fecha_hasta: { [Op.gte]: fin } }
              ]
            }
          ]
        },
        include: [{ model: Concepto, where: { estado: 'Activo' }, required: true }],
        transaction: t
      });

      const conceptosGlobales = await Concepto.findAll({
        where: { es_global: true, estado: 'Activo' },
        transaction: t
      });

      const movimientos = await Movimiento.findAll({
        where: {
          id_periodo: periodoId,
          id_empleado: empleado.id_empleado,
          estado: 'Activo'
        },
        include: [{ model: Concepto, where: { estado: 'Activo' }, required: true }],
        transaction: t
      });

      let salarioBruto = round2(base);
      let totalDeducciones = 0;
      let detalles = [];
      const conceptosPorTramosPendientes = new Map();

      //procesar asignaciones
      for (const asignacion of asignaciones) {
        if (String(asignacion.Concepto?.regla_calculo || 'normal').toLowerCase() === 'tramos') {
          conceptosPorTramosPendientes.set(asignacion.id_concepto, asignacion.Concepto);
          continue;
        }
        const montoCalculado = calcularMonto(asignacion.Concepto, empleado, asignacion);
        const monto = validarMontoCalculado(montoCalculado, empleado, asignacion.Concepto, 'asignación');
        if (monto <= 0) continue;
        detalles.push({ id_concepto: asignacion.id_concepto, monto });
        if (asignacion.Concepto.tipo === 'ingreso') salarioBruto = round2(salarioBruto + monto);
        else totalDeducciones = round2(totalDeducciones + monto);
      }

      //procesar globales
      for (const concepto of conceptosGlobales) {
        if (String(concepto?.regla_calculo || 'normal').toLowerCase() === 'tramos') {
          conceptosPorTramosPendientes.set(concepto.id_concepto, concepto);
          continue;
        }
        const montoCalculado = calcularMonto(concepto, empleado, null);
        const monto = validarMontoCalculado(montoCalculado, empleado, concepto, 'concepto global');
        if (monto <= 0) continue;
        detalles.push({ id_concepto: concepto.id_concepto, monto });
        if (concepto.tipo === 'ingreso') salarioBruto = round2(salarioBruto + monto);
        else totalDeducciones = round2(totalDeducciones + monto);
      }

      //procesar movimientos manuales
      for (const mov of movimientos) {
        if (String(mov.Concepto?.regla_calculo || 'normal').toLowerCase() === 'tramos') {
          conceptosPorTramosPendientes.set(mov.id_concepto, mov.Concepto);
          continue;
        }
        const monto = validarMontoCalculado(parseFloat(mov.monto), empleado, mov.Concepto, 'movimiento');
        if (monto <= 0) continue;
        detalles.push({ id_concepto: mov.id_concepto, monto });
        if (mov.Concepto.tipo === 'ingreso') salarioBruto = round2(salarioBruto + monto);
        else totalDeducciones = round2(totalDeducciones + monto);
      }

      for (const [idConcepto, concepto] of conceptosPorTramosPendientes.entries()) {
        const montoCalculado = calcularMonto(concepto, empleado, null, { baseGravable: salarioBruto });
        const monto = validarMontoCalculado(montoCalculado, empleado, concepto, 'regla por tramos');
        if (monto <= 0) continue;
        detalles.push({ id_concepto: idConcepto, monto });
        if (concepto.tipo === 'ingreso') salarioBruto = round2(salarioBruto + monto);
        else totalDeducciones = round2(totalDeducciones + monto);
      }

      const salarioNeto = round2(salarioBruto - totalDeducciones);
      if (totalDeducciones > salarioBruto || salarioNeto < 0) {
        throw new Error(
          `El empleado "${empleado.nombre_completo}" genera un salario neto negativo. ` +
          `Revise asignaciones/movimientos/deducciones antes de procesar nómina.`
        );
      }

      //guardar registro
      const registro = await NominaRegistro.create({
        id_periodo: periodoId,
        id_empleado: empleado.id_empleado,
        salario_bruto: salarioBruto,
        total_deducciones: totalDeducciones,
        salario_neto: salarioNeto
      }, { transaction: t });

      //guardar detalles
      for (const d of detalles) {
        await NominaDetalle.create({
          id_registro: registro.id_registro,
          id_concepto: d.id_concepto,
          monto: d.monto
        }, { transaction: t });
      }
    }

    //actualizar estado periodo
    await periodo.update({ estado: 'Procesado' }, { transaction: t });
  });
}

module.exports = { ejecutarNomina };
