const { Empleado, Area } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const empleados = await Empleado.findAll({
      include: [{ model: Area, attributes: ['id_area', 'area'] }]
    });
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id, {
      include: [{ model: Area, attributes: ['id_area', 'area'] }]
    });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { dni, nombre_completo, cargo, fecha_ingreso, numero_ihss, cta_bancaria, salario_base, estado, id_area } = req.body;
    const nuevoEmpleado = await Empleado.create({
      dni,
      nombre_completo,
      cargo,
      fecha_ingreso,
      numero_ihss,
      cta_bancaria,
      salario_base: salario_base != null ? salario_base : 0,
      estado: estado || 'Activo',
      id_area
    });
    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    const { dni, nombre_completo, cargo, fecha_ingreso, numero_ihss, cta_bancaria, salario_base, estado, id_area } = req.body;
    await empleado.update({
      dni,
      nombre_completo,
      cargo,
      fecha_ingreso,
      numero_ihss,
      cta_bancaria,
      salario_base: salario_base != null ? salario_base : empleado.salario_base,
      estado: estado || 'Activo',
      id_area
    });
    res.json(empleado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    await empleado.update({ estado: 'Inactivo' });
    res.json({ message: 'Empleado marcado como Inactivo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






exports.getActivos = async (req, res) => {
  try {
    const empleados = await Empleado.findAll({ where: { estado: 'Activo' } });
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
