// services/nominaServices.js
const { Op } = require('sequelize');
const { sequelize, Periodo, Empleado, Concepto, EmpleadoConcepto, Movimiento, NominaRegistro, NominaDetalle } = require('../models');

function salarioBaseNumerico(empleado) {
  const n = parseFloat(empleado.salario_base);
  return Number.isFinite(n) ? n : 0;
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

    const empleados = await Empleado.findAll({ where: { estado: 'Activo' }, transaction: t });
    const ini = periodo.fecha_inicio;
    const fin = periodo.fecha_final;

    for (const empleado of empleados) {
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

      let salarioBruto = salarioBaseNumerico(empleado);
      let totalDeducciones = 0;
      let detalles = [];

      // Procesar asignaciones
      for (const asignacion of asignaciones) {
        const monto = calcularMonto(asignacion.Concepto, empleado, asignacion);
        detalles.push({ id_concepto: asignacion.id_concepto, monto });
        if (asignacion.Concepto.tipo === 'ingreso') salarioBruto += monto;
        else totalDeducciones += monto;
      }

      // Procesar globales
      for (const concepto of conceptosGlobales) {
        const monto = calcularMonto(concepto, empleado);
        detalles.push({ id_concepto: concepto.id_concepto, monto });
        if (concepto.tipo === 'ingreso') salarioBruto += monto;
        else totalDeducciones += monto;
      }

      // Procesar movimientos manuales
      for (const mov of movimientos) {
        detalles.push({ id_concepto: mov.id_concepto, monto: parseFloat(mov.monto) });
        if (mov.Concepto.tipo === 'ingreso') salarioBruto += parseFloat(mov.monto);
        else totalDeducciones += parseFloat(mov.monto);
      }

      const salarioNeto = salarioBruto - totalDeducciones;

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
