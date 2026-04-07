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

function parseTramosJson(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (_) {
      return null;
    }
  }
  return null;
}

function normalizarYValidarTramos(rawTramos) {
  if (!Array.isArray(rawTramos) || rawTramos.length === 0) {
    return { ok: false, error: 'Debe definir al menos un tramo para la regla progresiva.' };
  }

  const tramos = [];
  for (const tramo of rawTramos) {
    const desde = toNumber(tramo?.desde);
    const tasa = toNumber(tramo?.tasa);
    const hasta = tramo?.hasta === null || tramo?.hasta === undefined || tramo?.hasta === ''
      ? null
      : toNumber(tramo?.hasta);

    if (!Number.isFinite(desde) || desde < 0) {
      return { ok: false, error: 'Tramo inválido: "desde" debe ser numérico y mayor o igual a 0.' };
    }
    if (!Number.isFinite(tasa) || tasa < 0 || tasa > 100) {
      return { ok: false, error: 'Tramo inválido: "tasa" debe estar entre 0 y 100.' };
    }
    if (hasta !== null && (!Number.isFinite(hasta) || hasta <= desde)) {
      return { ok: false, error: 'Tramo inválido: "hasta" debe ser mayor que "desde", o dejarse vacío para tramo abierto.' };
    }

    tramos.push({ desde, hasta, tasa });
  }

  tramos.sort((a, b) => a.desde - b.desde);
  for (let i = 1; i < tramos.length; i++) {
    const prev = tramos[i - 1];
    const curr = tramos[i];
    if (prev.hasta === null) {
      return { ok: false, error: 'Tramos inválidos: no puede haber filas después de un tramo abierto.' };
    }
    if (curr.desde < prev.hasta) {
      return { ok: false, error: 'Tramos inválidos: existen traslapes entre rangos.' };
    }
  }

  return { ok: true, data: tramos };
}

function validarPayload(payload) {
  const nombre = sanitize(payload.concepto);
  const tipo = sanitize(payload.tipo);
  const naturaleza = sanitize(payload.naturaleza);
  const reglaCalculo = sanitize(payload.regla_calculo) || 'normal';
  const valor = toNumber(payload.valor_defecto);
  const aplicaTope = payload.aplica_tope === true || payload.aplica_tope === 'true' || payload.aplica_tope === 1 || payload.aplica_tope === '1';
  const topeMontoRaw = payload.tope_monto;
  const topeMonto = topeMontoRaw === null || topeMontoRaw === undefined || topeMontoRaw === '' ? null : toNumber(topeMontoRaw);
  const tramosRaw = parseTramosJson(payload.tramos_json);

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
  if (!['normal', 'tramos'].includes(reglaCalculo)) {
    return { ok: false, error: 'Regla de cálculo inválida.' };
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

  if (reglaCalculo === 'tramos') {
    const validacionTramos = normalizarYValidarTramos(tramosRaw);
    if (!validacionTramos.ok) return { ok: false, error: validacionTramos.error };

    return {
      ok: true,
      data: {
        concepto: nombre,
        tipo,
        naturaleza,
        regla_calculo: reglaCalculo,
        tramos_json: JSON.stringify(validacionTramos.data),
        valor_defecto: valor,
        aplica_tope: false,
        tope_monto: null,
        es_global: !!payload.es_global,
        estado: sanitize(payload.estado) || 'Activo'
      }
    };
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
      regla_calculo: 'normal',
      tramos_json: null,
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
    const conceptos = await Concepto.findAll({
      where: { estado: 'Activo', naturaleza: 'manual', regla_calculo: 'normal' }
    });
    res.json(conceptos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
