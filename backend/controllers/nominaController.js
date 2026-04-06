'use strict';

const { Empleado, Area, Movimiento, Periodo } = require('../models');
const { ejecutarNomina } = require('../services/nominaServices');

exports.getPeriodosAbiertos = async (req, res) => {
  try {
    const periodos = await Periodo.findAll({
      where: { estado: 'Abierto' },
      order: [['fecha_inicio', 'ASC']]
    });
    res.json(periodos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEstadoActual = async (req, res) => {
  try {
    const idPeriodo = Number(req.params.idPeriodo);
    if (!Number.isInteger(idPeriodo) || idPeriodo <= 0) {
      return res.status(400).json({ error: 'ID de período inválido' });
    }

    const periodo = await Periodo.findByPk(idPeriodo);
    if (!periodo) return res.status(404).json({ error: 'Período no encontrado' });
    if (periodo.estado !== 'Abierto') {
      return res.status(400).json({ error: 'Solo se pueden consultar empleados de períodos Abiertos para procesar nómina' });
    }

    const empleadosValidados = await Empleado.count({ where: { estado: 'Activo' } });
    const movimientosRegistrados = await Movimiento.count({
      where: { id_periodo: idPeriodo, estado: 'Activo' }
    });

    const estado = periodo.estado === 'Abierto' ? 'Pendiente de Cálculo' : periodo.estado;
    const calculoPendiente = periodo.estado === 'Abierto';
    const aprobacionPendiente = periodo.estado === 'Procesado';
    res.json({
      estado,
      empleadosValidados: empleadosValidados > 0,
      movimientosRegistrados: movimientosRegistrados > 0,
      calculoPendiente,
      aprobacionPendiente
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmpleadosProcesar = async (req, res) => {
  try {
    const idPeriodo = Number(req.query.id_periodo);
    const idArea = req.query.id_area ? Number(req.query.id_area) : null;

    if (!Number.isInteger(idPeriodo) || idPeriodo <= 0) {
      return res.status(400).json({ error: 'Debe enviar id_periodo válido' });
    }
    if (req.query.id_area && (!Number.isInteger(idArea) || idArea <= 0)) {
      return res.status(400).json({ error: 'Debe enviar id_area válido' });
    }

    const periodo = await Periodo.findByPk(idPeriodo);
    if (!periodo) return res.status(404).json({ error: 'Período no encontrado' });
    if (periodo.estado !== 'Abierto') {
      return res.status(400).json({ error: 'Solo se pueden consultar empleados de períodos Abiertos para procesar nómina' });
    }

    const where = { estado: 'Activo' };
    if (Number.isFinite(idArea)) where.id_area = idArea;

    const empleados = await Empleado.findAll({
      where,
      include: [{ model: Area, attributes: ['id_area', 'area'] }],
      order: [['nombre_completo', 'ASC']]
    });

    res.json({ total: empleados.length, empleados });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.ejecutar = async (req, res) => {
  try {
    const idPeriodo = Number(req.body.id_periodo);
    if (!Number.isInteger(idPeriodo) || idPeriodo <= 0) {
      return res.status(400).json({ error: 'Debe enviar id_periodo válido' });
    }

    await ejecutarNomina(idPeriodo);
    res.json({ message: 'Nómina ejecutada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
