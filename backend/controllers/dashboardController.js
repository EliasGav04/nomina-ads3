'use strict';

const { Empleado, Periodo, sequelize } = require('../models');

exports.getResumen = async (req, res) => {
  try {
    const [totalEmpleados, periodoAbierto, ultimoProcesado] = await Promise.all([
      Empleado.count({ where: { estado: 'Activo' } }),
      Periodo.findOne({
        where: { estado: 'Abierto' },
        order: [['fecha_inicio', 'DESC']]
      }),
      Periodo.findOne({
        where: { estado: 'Procesado' },
        order: [['fecha_inicio', 'DESC']]
      })
    ]);

    const periodoActual = periodoAbierto || ultimoProcesado || null;
    // Aproximado del período actual: suma base de empleados activos
    const totalBase = await Empleado.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('salario_base')), 'total_base']],
      where: { estado: 'Activo' },
      raw: true
    });
    const nominaMes = parseFloat(totalBase?.total_base) || 0;

    res.json({
      total_empleados: totalEmpleados,
      nomina_mes: nominaMes,
      periodo_actual: periodoActual
        ? {
            id_periodo: periodoActual.id_periodo,
            periodo: periodoActual.periodo,
            estado: periodoActual.estado
          }
        : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
