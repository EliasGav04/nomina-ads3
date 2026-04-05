const { Op } = require('sequelize');
const { EmpleadoConcepto, Empleado, Concepto } = require('../models');

function toDateOnly(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function isValidDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function validarAsignacion(payload, registroId = null) {
  const idEmpleado = Number(payload.id_empleado);
  const idConcepto = Number(payload.id_concepto);
  const valor = toNumber(payload.valor);
  const fechaDesde = toDateOnly(payload.fecha_desde);
  const fechaHasta = toDateOnly(payload.fecha_hasta);

  if (!Number.isFinite(idEmpleado)) return { ok: false, error: 'Debe seleccionar un empleado válido' };
  if (!Number.isFinite(idConcepto)) return { ok: false, error: 'Debe seleccionar un concepto válido' };
  if (Number.isNaN(valor) || valor <= 0) return { ok: false, error: 'El valor debe ser mayor a 0' };
  if (!fechaDesde || !isValidDateOnly(fechaDesde)) return { ok: false, error: 'Debe seleccionar una fecha desde válida' };
  if (fechaHasta && !isValidDateOnly(fechaHasta)) return { ok: false, error: 'La fecha hasta no es válida' };
  if (fechaHasta && fechaHasta < fechaDesde) return { ok: false, error: 'La fecha hasta no puede ser menor que la fecha desde' };

  const [empleado, concepto] = await Promise.all([
    Empleado.findByPk(idEmpleado),
    Concepto.findByPk(idConcepto)
  ]);
  if (!empleado || empleado.estado !== 'Activo') return { ok: false, error: 'El empleado seleccionado no está activo' };
  if (!concepto || concepto.estado !== 'Activo') return { ok: false, error: 'El concepto seleccionado no está activo' };
  if (!['fijo', 'porcentaje'].includes(concepto.naturaleza)) {
    return { ok: false, error: 'Solo se permiten asignaciones para conceptos de naturaleza fijo o porcentaje' };
  }

  // No permitir otro registro vigente para mismo empleado-concepto
  const vigente = await EmpleadoConcepto.findOne({
    where: {
      id_empleado: idEmpleado,
      id_concepto: idConcepto,
      fecha_hasta: null,
      ...(registroId ? { id_empleado_concepto: { [Op.ne]: registroId } } : {})
    }
  });
  if (vigente) {
    return { ok: false, error: 'Ya existe una asignación vigente para este empleado y concepto' };
  }

  // No permitir traslape de rangos de fechas
  const overlaps = await EmpleadoConcepto.findOne({
    where: {
      id_empleado: idEmpleado,
      id_concepto: idConcepto,
      ...(registroId ? { id_empleado_concepto: { [Op.ne]: registroId } } : {}),
      [Op.and]: [
        { fecha_desde: { [Op.lte]: fechaHasta || '9999-12-31' } },
        {
          [Op.or]: [
            { fecha_hasta: null },
            { fecha_hasta: { [Op.gte]: fechaDesde } }
          ]
        }
      ]
    }
  });

  if (overlaps) {
    return { ok: false, error: 'Conflicto de fechas: existe una asignación traslapada para este empleado y concepto' };
  }

  return {
    ok: true,
    data: {
      id_empleado: idEmpleado,
      id_concepto: idConcepto,
      valor,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta || null
    }
  };
}

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
    const validation = await validarAsignacion(req.body);
    if (!validation.ok) return res.status(409).json({ error: validation.error });

    const nuevoRegistro = await EmpleadoConcepto.create({
      ...validation.data
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

    const validation = await validarAsignacion(req.body, registro.id_empleado_concepto);
    if (!validation.ok) return res.status(409).json({ error: validation.error });

    await registro.update({
      ...validation.data
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
