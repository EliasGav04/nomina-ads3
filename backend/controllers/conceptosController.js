const { Concepto } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const conceptos = await Concepto.findAll();
    res.json(conceptos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const concepto = await Concepto.findByPk(req.params.id);
    if (!concepto) return res.status(404).json({ error: 'Concepto no encontrado' });
    res.json(concepto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { concepto, tipo, naturaleza, valor_defecto, es_global, estado } = req.body;
    const nuevoConcepto = await Concepto.create({
      concepto,
      tipo,
      naturaleza,
      valor_defecto,
      es_global,
      estado: estado || 'Activo'
    });
    res.status(201).json(nuevoConcepto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const concepto = await Concepto.findByPk(req.params.id);
    if (!concepto) return res.status(404).json({ error: 'Concepto no encontrado' });

    const { concepto: nombre, tipo, naturaleza, valor_defecto, es_global, estado } = req.body;
    await concepto.update({
      concepto: nombre,
      tipo,
      naturaleza,
      valor_defecto,
      es_global,
      estado: estado || 'Activo'
    });
    res.json(concepto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const concepto = await Concepto.findByPk(req.params.id);
    if (!concepto) return res.status(404).json({ error: 'Concepto no encontrado' });

    await concepto.update({ estado: 'Inactivo' });
    res.json({ message: 'Concepto marcado como Inactivo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





exports.getManualesActivos = async (req, res) => {
  try {
    const conceptos = await Concepto.findAll({ where: { estado: 'Activo', naturaleza: 'manual' } });
    res.json(conceptos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
