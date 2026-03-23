const { Area } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const areas = await Area.findAll();
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ error: 'Área no encontrada' });
    res.json(area);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { area, estado } = req.body;
    const nuevaArea = await Area.create({
      area,
      estado: estado || 'Activo'
    });
    res.status(201).json(nuevaArea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ error: 'Área no encontrada' });

    const { area: nombre, estado } = req.body;
    await area.update({ area: nombre, estado: estado || 'Activo' });
    res.json(area);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const area = await Area.findByPk(req.params.id);
    if (!area) return res.status(404).json({ error: 'Área no encontrada' });

    await area.update({ estado: 'Inactivo' });
    res.json({ message: 'Área marcada como Inactiva' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
