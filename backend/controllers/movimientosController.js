const { Op } = require('sequelize');
const { Movimiento, Periodo, Empleado, Concepto } = require('../models');

function sanitize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

async function validarPayloadMovimiento(payload, idActual = null) {
  const id_periodo = Number(payload.id_periodo);
  const id_empleado = Number(payload.id_empleado);
  const id_concepto = Number(payload.id_concepto);
  const monto = toNumber(payload.monto);
  const descripcion = sanitize(payload.descripcion);

  if (!Number.isFinite(id_periodo)) return { ok: false, error: 'Debe seleccionar un período válido' };
  if (!Number.isFinite(id_empleado)) return { ok: false, error: 'Debe seleccionar un empleado válido' };
  if (!Number.isFinite(id_concepto)) return { ok: false, error: 'Debe seleccionar un concepto válido' };
  if (Number.isNaN(monto) || monto <= 0 || monto > 1000000) {
    return { ok: false, error: 'El monto debe ser mayor a 0 y menor o igual a 1,000,000' };
  }
  if (!descripcion || descripcion.length < 5 || descripcion.length > 200) {
    return { ok: false, error: 'La descripción es obligatoria (mínimo 5 y máximo 200 caracteres)' };
  }

  const [periodo, empleado, concepto] = await Promise.all([
    Periodo.findByPk(id_periodo, { attributes: ['id_periodo', 'estado'] }),
    Empleado.findByPk(id_empleado, { attributes: ['id_empleado', 'estado'] }),
    Concepto.findByPk(id_concepto, { attributes: ['id_concepto', 'estado', 'naturaleza'] })
  ]);

  if (!periodo) return { ok: false, error: 'Período no encontrado' };
  if (periodo.estado !== 'Abierto') return { ok: false, error: 'Solo se pueden crear/editar movimientos en períodos Abiertos' };
  if (!empleado || empleado.estado !== 'Activo') return { ok: false, error: 'El empleado seleccionado no está activo' };
  if (!concepto || concepto.estado !== 'Activo') return { ok: false, error: 'El concepto seleccionado no está activo' };
  if (concepto.naturaleza !== 'manual') {
    return { ok: false, error: 'Solo se permiten movimientos para conceptos de naturaleza manual' };
  }

  const duplicado = await Movimiento.findOne({
    where: {
      id_periodo,
      id_empleado,
      id_concepto,
      estado: 'Activo',
      ...(idActual ? { id_movimiento: { [Op.ne]: idActual } } : {})
    }
  });
  if (duplicado) {
    return { ok: false, error: 'Ya existe un movimiento activo para el mismo período, empleado y concepto' };
  }

  return {
    ok: true,
    data: { id_periodo, id_empleado, id_concepto, monto, descripcion }
  };
}

exports.getAll = async (req, res) => {
  try {
    const movimientos = await Movimiento.findAll({
      include: [
        { model: Periodo, attributes: ['id_periodo', 'periodo', 'estado'] },
        { model: Empleado, attributes: ['id_empleado', 'nombre_completo'] },
        { model: Concepto, attributes: ['id_concepto', 'concepto', 'tipo', 'naturaleza'] }
      ]
    });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const movimiento = await Movimiento.findByPk(req.params.id, {
      include: [
        { model: Periodo, attributes: ['id_periodo', 'periodo', 'estado'] },
        { model: Empleado, attributes: ['id_empleado', 'nombre_completo'] },
        { model: Concepto, attributes: ['id_concepto', 'concepto', 'tipo', 'naturaleza'] }
      ]
    });
    if (!movimiento) return res.status(404).json({ error: 'Movimiento no encontrado' });
    res.json(movimiento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const validation = await validarPayloadMovimiento(req.body);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    const nuevoMovimiento = await Movimiento.create({
      ...validation.data,
      estado: 'Activo'
    });
    res.status(201).json(nuevoMovimiento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const movimiento = await Movimiento.findByPk(req.params.id, {
      include: [{ model: Periodo, attributes: ['estado'] }]
    });
    if (!movimiento) return res.status(404).json({ error: 'Movimiento no encontrado' });

    //validar estado periodo
    if (movimiento.Periodo.estado !== 'Abierto') {
      return res.status(400).json({ error: 'No se pueden editar movimientos de un período cerrado o procesado' });
    }
    const validation = await validarPayloadMovimiento(req.body, movimiento.id_movimiento);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    await movimiento.update({
      ...validation.data,
      estado: 'Activo'
    });
    res.json(movimiento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const movimiento = await Movimiento.findByPk(req.params.id, {
      include: [{ model: Periodo, attributes: ['estado'] }]
    });
    if (!movimiento) return res.status(404).json({ error: 'Movimiento no encontrado' });

    //validar estado periodo
    if (movimiento.Periodo.estado !== 'Abierto') {
      return res.status(400).json({ error: 'No se pueden eliminar movimientos de un período cerrado o procesado' });
    }

    await movimiento.update({ estado: 'Anulado' }); //baja logica
    res.json({ message: 'Movimiento marcado como Anulado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
