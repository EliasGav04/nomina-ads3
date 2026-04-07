const { Concepto } = require('../models');
const { Op } = require('sequelize');

const conceptoPattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;

function sanitize(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function validarPayload(payload) {
  const nombre = sanitize(payload.concepto);
  const tipo = sanitize(payload.tipo);
  const naturaleza = sanitize(payload.naturaleza);
  const valor = toNumber(payload.valor_defecto);
  const aplicaTope = payload.aplica_tope === true || payload.aplica_tope === 'true' || payload.aplica_tope === 1 || payload.aplica_tope === '1';
  const topeMontoRaw = payload.tope_monto;
  const topeMonto = topeMontoRaw === null || topeMontoRaw === undefined || topeMontoRaw === '' ? null : toNumber(topeMontoRaw);

  if (!nombre || typeof nombre !== 'string') {
    return { ok: false, error: 'El nombre del concepto es obligatorio' };
  }
  if (nombre.length < 3 || nombre.length > 100 || !conceptoPattern.test(nombre)) {
    return { ok: false, error: 'El concepto debe tener entre 3 y 100 caracteres y solo letras/espacios' };
  }
  if (!['ingreso', 'deduccion'].includes(tipo)) {
    return { ok: false, error: 'Tipo de concepto inválido' };
  }
  if (!['fijo', 'porcentaje', 'manual'].includes(naturaleza)) {
    return { ok: false, error: 'Naturaleza de concepto inválida' };
  }
  if (Number.isNaN(valor)) {
    return { ok: false, error: 'El valor por defecto es obligatorio' };
  }
  if (naturaleza === 'porcentaje') {
    const tieneHastaDosDecimales = /^\d+(\.\d{1,2})?$/.test(String(payload.valor_defecto));
    if (!tieneHastaDosDecimales || valor < 0 || valor > 100) {
      return { ok: false, error: 'Para naturaleza porcentaje, el valor debe estar entre 0 y 100 con máximo 2 decimales' };
    }
  } else if (valor < 0 || valor > 1000000) {
    return { ok: false, error: 'El valor por defecto debe estar entre 0 y 1,000,000' };
  }

  if (aplicaTope) {
    if (!(tipo === 'deduccion' && naturaleza === 'porcentaje')) {
      return { ok: false, error: 'El tope solo puede aplicarse a conceptos de tipo deducción y naturaleza porcentaje.' };
    }
    if (topeMonto === null || Number.isNaN(topeMonto) || topeMonto <= 0 || topeMonto > 1000000) {
      return { ok: false, error: 'Tope inválido. Debe ser mayor a 0 y menor o igual a 1,000,000.' };
    }
  }

  return {
    ok: true,
    data: {
      concepto: nombre,
      tipo,
      naturaleza,
      valor_defecto: valor,
      aplica_tope: aplicaTope,
      tope_monto: aplicaTope ? topeMonto : null,
      es_global: !!payload.es_global,
      estado: sanitize(payload.estado) || 'Activo'
    }
  };
}

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
    const validation = validarPayload(req.body);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    const existente = await Concepto.findOne({
      where: {
        concepto: validation.data.concepto,
        tipo: validation.data.tipo,
        estado: { [Op.ne]: 'Inactivo' }
      }
    });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un concepto activo con ese nombre y tipo' });
    }

    const nuevoConcepto = await Concepto.create({
      ...validation.data
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

    const validation = validarPayload(req.body);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    const existente = await Concepto.findOne({
      where: {
        concepto: validation.data.concepto,
        tipo: validation.data.tipo,
        estado: { [Op.ne]: 'Inactivo' },
        id_concepto: { [Op.ne]: concepto.id_concepto }
      }
    });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un concepto activo con ese nombre y tipo' });
    }

    await concepto.update({
      ...validation.data
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
