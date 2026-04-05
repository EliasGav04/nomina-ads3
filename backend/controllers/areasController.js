const { Area } = require('../models');
const { Op } = require('sequelize');

const areaPattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;

function sanitize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validarArea(nombre) {
  if (!nombre) return 'El nombre del área es obligatorio';
  if (nombre.length < 3 || nombre.length > 50) return 'El área debe tener entre 3 y 50 caracteres';
  if (!areaPattern.test(nombre)) return 'El área solo puede contener letras';
  return null;
}

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
    const areaNombre = sanitize(req.body.area);
    const estado = req.body.estado;

    const errorValidacion = validarArea(areaNombre);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const existente = await Area.findOne({
      where: { area: { [Op.eq]: areaNombre } }
    });
    if (existente) return res.status(400).json({ error: 'Ya existe un área con ese nombre' });

    const nuevaArea = await Area.create({
      area: areaNombre,
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

    const nombre = sanitize(req.body.area);
    const estado = req.body.estado;

    const errorValidacion = validarArea(nombre);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const existente = await Area.findOne({
      where: {
        area: { [Op.eq]: nombre },
        id_area: { [Op.ne]: area.id_area }
      }
    });
    if (existente) return res.status(400).json({ error: 'Ya existe un área con ese nombre' });

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
