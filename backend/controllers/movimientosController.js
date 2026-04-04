const { Movimiento, Periodo, Empleado, Concepto } = require('../models');

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
    const { id_periodo, id_empleado, id_concepto, monto, descripcion } = req.body;
    const periodo = await Periodo.findByPk(id_periodo, { attributes: ['estado'] });
    if (!periodo) return res.status(404).json({ error: 'Período no encontrado' });
    if (periodo.estado !== 'Abierto') {
      return res.status(400).json({ error: 'Solo se pueden crear movimientos en períodos Abiertos' });
    }

    const nuevoMovimiento = await Movimiento.create({
      id_periodo,
      id_empleado,
      id_concepto,
      monto,
      descripcion,
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

    // Validar estado del período
    if (movimiento.Periodo.estado !== 'Abierto') {
      return res.status(400).json({ error: 'No se pueden editar movimientos de un período cerrado o procesado' });
    }

    const { id_periodo, id_empleado, id_concepto, monto, descripcion } = req.body;
    await movimiento.update({
      id_periodo,
      id_empleado,
      id_concepto,
      monto,
      descripcion
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

    // Validar estado del período
    if (movimiento.Periodo.estado !== 'Abierto') {
      return res.status(400).json({ error: 'No se pueden eliminar movimientos de un período cerrado o procesado' });
    }

    await movimiento.update({ estado: 'Anulado' }); // soft delete
    res.json({ message: 'Movimiento marcado como Anulado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
