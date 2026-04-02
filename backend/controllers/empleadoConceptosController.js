const { EmpleadoConcepto, Empleado, Concepto } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const registros = await EmpleadoConcepto.findAll({
      include: [
        { model: Empleado, attributes: ['id_empleado', 'nombre_completo'] },
        { model: Concepto, attributes: ['id_concepto', 'concepto', 'tipo', 'naturaleza'] }
      ]
    });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const registro = await EmpleadoConcepto.findByPk(req.params.id, {
      include: [
        { model: Empleado, attributes: ['id_empleado', 'nombre_completo'] },
        { model: Concepto, attributes: ['id_concepto', 'concepto', 'tipo', 'naturaleza'] }
      ]
    });
    if (!registro) return res.status(404).json({ error: 'Asignación no encontrada' });
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { id_empleado, id_concepto, valor, fecha_desde, fecha_hasta } = req.body;
    const nuevoRegistro = await EmpleadoConcepto.create({
      id_empleado,
      id_concepto,
      valor,
      fecha_desde,
      fecha_hasta
    });
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const registro = await EmpleadoConcepto.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ error: 'Asignación no encontrada' });

    const { id_empleado, id_concepto, valor, fecha_desde, fecha_hasta } = req.body;
    await registro.update({
      id_empleado,
      id_concepto,
      valor,
      fecha_desde,
      fecha_hasta
    });
    res.json(registro);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const registro = await EmpleadoConcepto.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ error: 'Asignación no encontrada' });

    await registro.update({ fecha_hasta: new Date() });
    res.json({ message: 'Asignación desactivada correctamente', registro });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
