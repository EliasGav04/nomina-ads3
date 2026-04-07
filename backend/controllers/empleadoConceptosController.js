const { Op } = require('sequelize');
const { EmpleadoConcepto, Empleado, Concepto, Periodo } = require('../models');

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

  //evitar otro registro vigente mismo empleado-concepto
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

  //evitar traslape de rangos fechas
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
    if (registro.fecha_hasta) {
      return res.status(409).json({ error: 'La asignación ya está desactivada' });
    }

    const periodoAbierto = await Periodo.findOne({
      where: { estado: 'Abierto' },
      order: [['fecha_final', 'ASC']]
    });
    if (!periodoAbierto) {
      return res.status(409).json({ error: 'No hay período Abierto para aplicar la baja.' });
    }

    const modo = String(req.body?.modo || 'no_aplicar_periodo_abierto').trim().toLowerCase();
    const finPeriodoAbierto = new Date(`${periodoAbierto.fecha_final}T00:00:00`);
    let fechaEfectiva = '';

    if (modo === 'fin_periodo_abierto') {
      fechaEfectiva = String(periodoAbierto.fecha_final);
    } else if (modo === 'no_aplicar_periodo_abierto') {
      //dejar sin vigencia antes cierre periodo abierto
      const fechaNoAplicar = new Date(finPeriodoAbierto);
      fechaNoAplicar.setDate(fechaNoAplicar.getDate() - 1);
      const yyyy = fechaNoAplicar.getFullYear();
      const mm = String(fechaNoAplicar.getMonth() + 1).padStart(2, '0');
      const dd = String(fechaNoAplicar.getDate()).padStart(2, '0');
      fechaEfectiva = `${yyyy}-${mm}-${dd}`;
    } else {
      return res.status(400).json({ error: 'Modo de baja inválido.' });
    }

    if (fechaEfectiva < String(registro.fecha_desde)) {
      return res.status(409).json({ error: 'La fecha efectiva no puede ser menor que la fecha desde de la asignación.' });
    }

    const periodoObjetivo = await Periodo.findOne({
      where: {
        fecha_inicio: { [Op.lte]: fechaEfectiva },
        fecha_final: { [Op.gte]: fechaEfectiva }
      }
    });
    if (periodoObjetivo && periodoObjetivo.estado !== 'Abierto') {
      return res.status(409).json({
        error: 'No puede dar de baja con una fecha que cae en un período Procesado/Cerrado.'
      });
    }

    await registro.update({ fecha_hasta: fechaEfectiva });
    res.json({ message: 'Asignación desactivada correctamente', registro, fecha_efectiva: fechaEfectiva });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
