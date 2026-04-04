const { Periodo, NominaRegistro, Empleado } = require('../models');


exports.getAll = async (req, res) => {
    try {
      const periodos = await Periodo.findAll({
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
    const { periodo, fecha_inicio, fecha_final, fecha_pago, estado } = req.body;
    const nuevoPeriodo = await Periodo.create({
      periodo,
      fecha_inicio,
      fecha_final,
      fecha_pago,
      estado: estado || 'Abierto'
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

    const { periodo: nombre, fecha_inicio, fecha_final, fecha_pago, estado } = req.body;
    await periodo.update({
      periodo: nombre,
      fecha_inicio,
      fecha_final,
      fecha_pago,
      estado
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