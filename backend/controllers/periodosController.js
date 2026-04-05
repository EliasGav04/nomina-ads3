const { Op } = require('sequelize');
const { Periodo, NominaRegistro, Empleado } = require('../models');

function sanitize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validarPayloadPeriodo(payload) {
  const periodo = sanitize(payload.periodo);
  const fechaInicio = sanitize(payload.fecha_inicio);
  const fechaFinal = sanitize(payload.fecha_final);
  const fechaPago = sanitize(payload.fecha_pago);

  if (!periodo || periodo.length < 3 || periodo.length > 100) {
    return { ok: false, error: 'El nombre del período es obligatorio (3 a 100 caracteres).' };
  }
  if (!isValidDateOnly(fechaInicio) || !isValidDateOnly(fechaFinal) || !isValidDateOnly(fechaPago)) {
    return { ok: false, error: 'Debe ingresar fechas válidas para inicio, fin y pago.' };
  }
  if (fechaInicio > fechaFinal) {
    return { ok: false, error: 'La fecha de inicio no puede ser mayor que la fecha final.' };
  }
  if (fechaPago < fechaFinal) {
    return { ok: false, error: 'La fecha de pago no puede ser anterior a la fecha final del período.' };
  }

  return {
    ok: true,
    data: {
      periodo,
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinal,
      fecha_pago: fechaPago
    }
  };
}


exports.getAll = async (req, res) => {
    try {
      const periodos = await Periodo.findAll({
        order: [['fecha_inicio', 'DESC']],
        include: [
          {
            model: NominaRegistro,
            attributes: ['id_empleado']
          }
        ]
      });
  
      const result = await Promise.all(periodos.map(async p => {
        const plain = p.toJSON();
  
        if (plain.estado === 'Abierto') {
          // contar empleados activos
          const activos = await Empleado.count({ where: { estado: 'Activo' } });
          plain.empleados = activos;
        } else {
          // contar registros de nómina
          plain.empleados = plain.NominaRegistros ? plain.NominaRegistros.length : 0;
        }
  
        delete plain.NominaRegistros;
        return plain;
      }));
  
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.getById = async (req, res) => {
    try {
      const periodo = await Periodo.findByPk(req.params.id, {
        include: [{ model: NominaRegistro, attributes: ['id_empleado'] }]
      });
      if (!periodo) return res.status(404).json({ error: 'Periodo no encontrado' });
  
      const plain = periodo.toJSON();
  
      if (plain.estado === 'Abierto') {
        const activos = await Empleado.count({ where: { estado: 'Activo' } });
        plain.empleados = activos;
      } else {
        plain.empleados = plain.NominaRegistros ? plain.NominaRegistros.length : 0;
      }
  
      delete plain.NominaRegistros;
      res.json(plain);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.create = async (req, res) => {
  try {
    const validacion = validarPayloadPeriodo(req.body);
    if (!validacion.ok) return res.status(400).json({ error: validacion.error });

    const estadoBloqueante = await Periodo.findOne({
      where: { estado: { [Op.in]: ['Abierto', 'Procesado'] } }
    });
    if (estadoBloqueante) {
      if (estadoBloqueante.estado === 'Abierto') {
        return res.status(400).json({ error: 'Ya existe un período Abierto. Debe procesarlo/cerrarlo antes de crear otro.' });
      }
      return res.status(400).json({ error: 'Existe un período Procesado pendiente de cierre. Debe cerrarlo antes de crear uno nuevo.' });
    }

    const traslape = await Periodo.findOne({
      where: {
        [Op.and]: [
          { fecha_inicio: { [Op.lte]: validacion.data.fecha_final } },
          { fecha_final: { [Op.gte]: validacion.data.fecha_inicio } }
        ]
      }
    });
    if (traslape) {
      return res.status(400).json({ error: 'Las fechas se traslapan con un período existente.' });
    }

    const nuevoPeriodo = await Periodo.create({
      ...validacion.data,
      estado: 'Abierto'
    });
    res.status(201).json(nuevoPeriodo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const periodo = await Periodo.findByPk(req.params.id);
    if (!periodo) return res.status(404).json({ error: 'Periodo no encontrado' });
    if (periodo.estado !== 'Abierto') {
      return res.status(400).json({ error: 'Solo se pueden editar períodos en estado Abierto' });
    }

    const validacion = validarPayloadPeriodo(req.body);
    if (!validacion.ok) return res.status(400).json({ error: validacion.error });

    const traslape = await Periodo.findOne({
      where: {
        id_periodo: { [Op.ne]: periodo.id_periodo },
        [Op.and]: [
          { fecha_inicio: { [Op.lte]: validacion.data.fecha_final } },
          { fecha_final: { [Op.gte]: validacion.data.fecha_inicio } }
        ]
      }
    });
    if (traslape) {
      return res.status(400).json({ error: 'Las fechas se traslapan con un período existente.' });
    }

    await periodo.update({
      ...validacion.data
    });
    res.json(periodo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const periodo = await Periodo.findByPk(req.params.id);
    if (!periodo) return res.status(404).json({ error: 'Periodo no encontrado' });
    if (periodo.estado !== 'Procesado') {
      return res.status(400).json({ error: 'Solo se puede cerrar un período Procesado' });
    }

    const registros = await NominaRegistro.count({ where: { id_periodo: periodo.id_periodo } });
    if (registros === 0) {
      return res.status(400).json({ error: 'No se puede cerrar un período Procesado sin registros de nómina.' });
    }

    await periodo.update({ estado: 'Cerrado' });
    res.json({ message: 'Periodo marcado como Cerrado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





exports.getAbiertos = async (req, res) => {
  try {
    const periodos = await Periodo.findAll({ where: { estado: 'Abierto' } });
    res.json(periodos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};