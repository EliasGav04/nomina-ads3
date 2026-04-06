// services/nominaServices.js
const { Op } = require('sequelize');
const { sequelize, Periodo, Empleado, Concepto, EmpleadoConcepto, Movimiento, NominaRegistro, NominaDetalle } = require('../models');

function salarioBaseNumerico(empleado) {
  const n = parseFloat(empleado.salario_base);
  return Number.isFinite(n) ? n : NaN;
}

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
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

/**
 * Función para calcular monto según naturaleza del concepto
 */
function calcularMonto(concepto, empleado, asignacion = null) {
  const base = salarioBaseNumerico(empleado);

  switch (concepto.naturaleza) {
    case 'fijo':
      return asignacion ? parseFloat(asignacion.valor) : parseFloat(concepto.valor_defecto);

    case 'porcentaje': {
      const porcentaje = asignacion ? parseFloat(asignacion.valor) : parseFloat(concepto.valor_defecto);
      return (base * porcentaje) / 100;
    }

    case 'manual':
      return 0;

    default:
      return 0;
  }
}

/**
 * Ejecuta la nómina para un período
 */
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

      // Asignaciones que cruzan el período y concepto activo
      const asignaciones = await EmpleadoConcepto.findAll({
        where: {
          id_empleado: empleado.id_empleado,
          [Op.and]: [
            { fecha_desde: { [Op.lte]: fin } },
            {
              [Op.or]: [
                { fecha_hasta: null },
                { fecha_hasta: { [Op.gte]: ini } }
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

      // Procesar asignaciones
      for (const asignacion of asignaciones) {
        const montoCalculado = calcularMonto(asignacion.Concepto, empleado, asignacion);
        const monto = validarMontoCalculado(montoCalculado, empleado, asignacion.Concepto, 'asignación');
        if (monto <= 0) continue;
        detalles.push({ id_concepto: asignacion.id_concepto, monto });
        if (asignacion.Concepto.tipo === 'ingreso') salarioBruto = round2(salarioBruto + monto);
        else totalDeducciones = round2(totalDeducciones + monto);
      }

      // Procesar globales
      for (const concepto of conceptosGlobales) {
        const montoCalculado = calcularMonto(concepto, empleado);
        const monto = validarMontoCalculado(montoCalculado, empleado, concepto, 'concepto global');
        if (monto <= 0) continue;
        detalles.push({ id_concepto: concepto.id_concepto, monto });
        if (concepto.tipo === 'ingreso') salarioBruto = round2(salarioBruto + monto);
        else totalDeducciones = round2(totalDeducciones + monto);
      }

      // Procesar movimientos manuales
      for (const mov of movimientos) {
        const monto = validarMontoCalculado(parseFloat(mov.monto), empleado, mov.Concepto, 'movimiento');
        if (monto <= 0) continue;
        detalles.push({ id_concepto: mov.id_concepto, monto });
        if (mov.Concepto.tipo === 'ingreso') salarioBruto = round2(salarioBruto + monto);
        else totalDeducciones = round2(totalDeducciones + monto);
      }

      const salarioNeto = round2(salarioBruto - totalDeducciones);

      // Guardar registro
      const registro = await NominaRegistro.create({
        id_periodo: periodoId,
        id_empleado: empleado.id_empleado,
        salario_bruto: salarioBruto,
        total_deducciones: totalDeducciones,
        salario_neto: salarioNeto
      }, { transaction: t });

      // Guardar detalles
      for (const d of detalles) {
        await NominaDetalle.create({
          id_registro: registro.id_registro,
          id_concepto: d.id_concepto,
          monto: d.monto
        }, { transaction: t });
      }
    }

    // Actualizar estado del período
    await periodo.update({ estado: 'Procesado' }, { transaction: t });
  });
}

module.exports = { ejecutarNomina };
