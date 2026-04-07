'use strict';

const { Op } = require('sequelize');
const { Infoempresa, Empleado, Periodo, NominaRegistro, NominaDetalle, Concepto, Area } = require('../models');

exports.getFiltros = async (req, res) => {
  try {
    const empleados = await Empleado.findAll({
      where: { estado: 'Activo' },
      attributes: ['id_empleado', 'dni', 'nombre_completo', 'cargo'],
      order: [['nombre_completo', 'ASC']]
    });

    const periodos = await Periodo.findAll({
      where: {
        estado: {
          [Op.in]: ['Procesado', 'Cerrado']
        }
      },
      attributes: ['id_periodo', 'periodo', 'fecha_inicio', 'fecha_final', 'fecha_pago', 'estado'],
      order: [['fecha_inicio', 'DESC']]
    });

    res.json({ empleados, periodos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoleta = async (req, res) => {
  try {
    const idEmpleado = Number(req.query.id_empleado);
    const idPeriodo = Number(req.query.id_periodo);

    if (!Number.isInteger(idEmpleado) || idEmpleado <= 0 || !Number.isInteger(idPeriodo) || idPeriodo <= 0) {
      return res.status(400).json({ error: 'Debe enviar id_empleado e id_periodo válidos' });
    }

    const empresa = await Infoempresa.findByPk(1);
    const empleado = await Empleado.findByPk(idEmpleado, {
      include: [{ model: Area, attributes: ['id_area', 'area'] }]
    });
    const periodo = await Periodo.findByPk(idPeriodo);

    if (!empleado || !periodo) {
      return res.status(404).json({ error: 'Empleado o período no encontrado' });
    }
    if (!['Procesado', 'Cerrado'].includes(periodo.estado)) {
      return res.status(400).json({ error: 'La boleta solo puede consultarse para períodos Procesados o Cerrados' });
    }

    const registro = await NominaRegistro.findOne({
      where: { id_empleado: idEmpleado, id_periodo: idPeriodo },
      include: [
        {
          model: NominaDetalle,
          include: [{ model: Concepto, attributes: ['id_concepto', 'concepto', 'tipo', 'naturaleza'] }]
        }
      ]
    });

    if (!registro) {
      return res.status(404).json({ error: 'No existe nómina procesada para el empleado y período seleccionados' });
    }

    const detalles = registro.NominaDetalles || [];
    const ingresosDetalles = [];
    const deducciones = [];

    for (const d of detalles) {
      const monto = parseFloat(d.monto);
      if (!Number.isFinite(monto) || monto === 0) continue;
      if (!d.Concepto) continue;

      const row = {
        id_concepto: d.id_concepto,
        concepto: d.Concepto.concepto,
        naturaleza: d.Concepto.naturaleza,
        monto
      };

      if (d.Concepto.tipo === 'ingreso') ingresosDetalles.push(row);
      else deducciones.push(row);
    }

    const salarioBrutoHistorico = parseFloat(registro.salario_bruto) || 0;
    const totalIngresosExtra = ingresosDetalles.reduce((acc, it) => acc + it.monto, 0);
    const salarioBaseHistorico = Math.max(salarioBrutoHistorico - totalIngresosExtra, 0);

    res.json({
      empresa: empresa
        ? {
            id_empresa: empresa.id_empresa,
            nombre: empresa.nombre,
            razon_social: empresa.razon_social,
            rtn: empresa.rtn,
            direccion: empresa.direccion,
            telefono: empresa.telefono,
            correo: empresa.correo,
            sitio_web: empresa.sitio_web,
            codigo_moneda: empresa.codigo_moneda || 'HNL',
            logoBase64: empresa.logo ? `data:${empresa.logo_mime};base64,${empresa.logo.toString('base64')}` : null
          }
        : null,
      empleado: {
        id_empleado: empleado.id_empleado,
        dni: empleado.dni,
        nombre_completo: empleado.nombre_completo,
        cargo: empleado.cargo,
        numero_ihss: empleado.numero_ihss,
        cta_bancaria: empleado.cta_bancaria,
        area: empleado.Area ? empleado.Area.area : null
      },
      periodo: {
        id_periodo: periodo.id_periodo,
        periodo: periodo.periodo,
        fecha_inicio: periodo.fecha_inicio,
        fecha_final: periodo.fecha_final,
        fecha_pago: periodo.fecha_pago,
        estado: periodo.estado
      },
      ingresos: [
        { concepto: 'Salario base', naturaleza: 'base', monto: salarioBaseHistorico },
        ...ingresosDetalles
      ],
      deducciones,
      resumen: {
        salario_base: salarioBaseHistorico,
        total_ingresos: salarioBaseHistorico + totalIngresosExtra,
        total_deducciones: parseFloat(registro.total_deducciones) || 0,
        salario_neto: parseFloat(registro.salario_neto) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
