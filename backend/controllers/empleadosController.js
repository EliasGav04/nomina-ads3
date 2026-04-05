const { Empleado, Area } = require('../models');
const { Op } = require('sequelize');

const dniPattern = /^\d{13}$/;
const nombrePattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
const cargoPattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9.,()\-\/\s]+$/;
const cuentaPattern = /^\d{14,20}$/;

function sanitize(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function validarEmpleadoPayload(payload) {
  const dni = sanitize(payload.dni);
  const nombre = sanitize(payload.nombre_completo);
  const cargo = sanitize(payload.cargo);
  const fechaIngreso = sanitize(payload.fecha_ingreso);
  const ihss = sanitize(payload.numero_ihss);
  const cuenta = sanitize(payload.cta_bancaria);
  const salario = toNumber(payload.salario_base);
  const idArea = Number(payload.id_area);

  if (!dniPattern.test(String(dni || ''))) {
    return { ok: false, error: 'DNI inválido. Debe contener exactamente 13 dígitos numéricos' };
  }
  if (!nombre || nombre.length < 5 || nombre.length > 120 || !nombrePattern.test(nombre)) {
    return { ok: false, error: 'Nombre inválido. Solo letras y espacios (5 a 120 caracteres)' };
  }
  if (!cargo || cargo.length < 3 || cargo.length > 100 || !cargoPattern.test(cargo)) {
    return { ok: false, error: 'Cargo inválido. Debe tener entre 3 y 100 caracteres' };
  }
  if (!fechaIngreso) {
    return { ok: false, error: 'La fecha de ingreso es obligatoria' };
  }
  const fechaParsed = new Date(fechaIngreso);
  if (Number.isNaN(fechaParsed.getTime())) {
    return { ok: false, error: 'La fecha de ingreso no es válida' };
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaParsed.setHours(0, 0, 0, 0);
  if (fechaParsed > hoy) {
    return { ok: false, error: 'La fecha de ingreso no puede ser mayor al día actual' };
  }
  if (!dniPattern.test(String(ihss || ''))) {
    return { ok: false, error: 'Número IHSS inválido. Debe contener exactamente 13 dígitos numéricos' };
  }
  if (!cuentaPattern.test(String(cuenta || ''))) {
    return { ok: false, error: 'Cuenta bancaria inválida. Debe contener entre 14 y 20 dígitos numéricos' };
  }
  if (Number.isNaN(salario) || salario <= 0 || salario > 1000000) {
    return { ok: false, error: 'Salario base inválido. Debe ser mayor a 0 y menor o igual a 1,000,000' };
  }
  if (!Number.isFinite(idArea)) {
    return { ok: false, error: 'Debe seleccionar un área válida' };
  }

  return {
    ok: true,
    data: {
      dni: String(dni),
      nombre_completo: nombre,
      cargo,
      fecha_ingreso: fechaIngreso,
      numero_ihss: String(ihss),
      cta_bancaria: String(cuenta),
      salario_base: salario,
      id_area: idArea,
      estado: sanitize(payload.estado) || 'Activo'
    }
  };
}

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
    const validation = validarEmpleadoPayload(req.body);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    const area = await Area.findByPk(validation.data.id_area);
    if (!area) return res.status(400).json({ error: 'El área seleccionada no existe' });

    const existente = await Empleado.findOne({
      where: {
        [Op.or]: [
          { dni: validation.data.dni },
          { numero_ihss: validation.data.numero_ihss },
          { cta_bancaria: validation.data.cta_bancaria }
        ],
        estado: { [Op.ne]: 'Inactivo' }
      }
    });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un empleado activo con el mismo DNI, IHSS o cuenta bancaria' });
    }

    const nuevoEmpleado = await Empleado.create({
      ...validation.data
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

    const validation = validarEmpleadoPayload(req.body);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    const area = await Area.findByPk(validation.data.id_area);
    if (!area) return res.status(400).json({ error: 'El área seleccionada no existe' });

    const existente = await Empleado.findOne({
      where: {
        [Op.or]: [
          { dni: validation.data.dni },
          { numero_ihss: validation.data.numero_ihss },
          { cta_bancaria: validation.data.cta_bancaria }
        ],
        estado: { [Op.ne]: 'Inactivo' },
        id_empleado: { [Op.ne]: empleado.id_empleado }
      }
    });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un empleado activo con el mismo DNI, IHSS o cuenta bancaria' });
    }

    await empleado.update({
      ...validation.data
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
