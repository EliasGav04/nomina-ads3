'use strict';

const { Area, Empleado, NominaRegistro, Periodo, Infoempresa } = require('../models');
const { Op } = require('sequelize');

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};

exports.getConfig = async (req, res) => {
  try {
    const [periodos, areas] = await Promise.all([
      Periodo.findAll({
        where: {
          estado: {
            [Op.in]: ['Procesado', 'Cerrado']
          }
        },
        attributes: ['id_periodo', 'periodo', 'fecha_inicio', 'fecha_final', 'fecha_pago'],
        order: [['fecha_inicio', 'DESC']]
      }),
      Area.findAll({
        where: { estado: 'Activo' },
        attributes: ['id_area', 'area'],
        order: [['area', 'ASC']]
      })
    ]);

    res.json({ periodos, areas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generar = async (req, res) => {
  try {
    const tipo = String(req.query.tipo || 'planilla_general');
    const idPeriodo = req.query.id_periodo ? Number(req.query.id_periodo) : null;
    const idArea = req.query.id_area ? Number(req.query.id_area) : null;

    if (!['planilla_general', 'nomina_por_area', 'anual_general'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de reporte inválido' });
    }

    const wherePeriodo = {};
    let periodoSeleccionado = null;
    let year = null;

    if (tipo === 'planilla_general' || tipo === 'nomina_por_area') {
      if (!Number.isFinite(idPeriodo)) {
        return res.status(400).json({ error: 'Debe enviar id_periodo para este tipo de reporte' });
      }
      periodoSeleccionado = await Periodo.findByPk(idPeriodo);
      if (!periodoSeleccionado) return res.status(404).json({ error: 'Período no encontrado' });
      wherePeriodo.id_periodo = idPeriodo;
    } else {
      if (Number.isFinite(idPeriodo)) {
        periodoSeleccionado = await Periodo.findByPk(idPeriodo);
      } else {
        periodoSeleccionado = await Periodo.findOne({
          where: {
            estado: {
              [Op.in]: ['Procesado', 'Cerrado']
            }
          },
          order: [['fecha_inicio', 'DESC']]
        });
      }
      if (!periodoSeleccionado?.fecha_inicio) {
        return res.status(400).json({ error: 'No hay período base para calcular reporte anual' });
      }
      year = new Date(periodoSeleccionado.fecha_inicio).getFullYear();
      wherePeriodo.fecha_inicio = {
        [Op.gte]: `${year}-01-01`,
        [Op.lte]: `${year}-12-31`
      };
      wherePeriodo.estado = {
        [Op.in]: ['Procesado', 'Cerrado']
      };
    }

    const whereEmpleado = {};
    if (Number.isFinite(idArea)) whereEmpleado.id_area = idArea;

    const registros = await NominaRegistro.findAll({
      include: [
        {
          model: Empleado,
          where: whereEmpleado,
          include: [{ model: Area, attributes: ['id_area', 'area'] }],
          attributes: ['id_empleado', 'nombre_completo', 'salario_base', 'id_area']
        },
        {
          model: Periodo,
          where: wherePeriodo,
          attributes: ['id_periodo', 'periodo', 'fecha_inicio']
        }
      ],
      order: [['id_registro', 'ASC']]
    });

    const areaSeleccionada =
      Number.isFinite(idArea) ? await Area.findByPk(idArea, { attributes: ['id_area', 'area'] }) : null;
    const empresa = await Infoempresa.findByPk(1);

    const baseRows = registros.map((r) => {
      const salarioBase = n(r.Empleado?.salario_base);
      const salarioBruto = n(r.salario_bruto);
      const ingresos = Math.max(salarioBruto - salarioBase, 0);
      const deducciones = n(r.total_deducciones);
      const neto = n(r.salario_neto);

      return {
        id_empleado: r.Empleado?.id_empleado,
        nombre_empleado: r.Empleado?.nombre_completo || '',
        area: r.Empleado?.Area?.area || 'Sin área',
        periodo: r.Periodo?.periodo || '',
        salario_base: salarioBase,
        ingresos,
        deducciones,
        neto
      };
    });

    const resumenBase = baseRows.reduce(
      (acc, it) => {
        acc.salario_base += it.salario_base;
        acc.ingresos += it.ingresos;
        acc.deducciones += it.deducciones;
        acc.neto += it.neto;
        return acc;
      },
      { salario_base: 0, ingresos: 0, deducciones: 0, neto: 0 }
    );

    let rows = [];

    if (tipo === 'planilla_general') {
      rows = baseRows.map((r) => ({
        codigo: r.id_empleado,
        nombre_empleado: r.nombre_empleado,
        salario_base: r.salario_base,
        ingresos: r.ingresos,
        deducciones: r.deducciones,
        neto: r.neto
      }));
    } else if (tipo === 'nomina_por_area') {
      const byArea = new Map();
      for (const r of baseRows) {
        if (!byArea.has(r.area)) {
          byArea.set(r.area, {
            area: r.area,
            empleados: 0,
            salario_base: 0,
            ingresos: 0,
            deducciones: 0,
            neto: 0
          });
        }
        const item = byArea.get(r.area);
        item.empleados += 1;
        item.salario_base += r.salario_base;
        item.ingresos += r.ingresos;
        item.deducciones += r.deducciones;
        item.neto += r.neto;
      }
      rows = Array.from(byArea.values());
    } else {
      const byPeriodo = new Map();
      for (const r of baseRows) {
        if (!byPeriodo.has(r.periodo)) {
          byPeriodo.set(r.periodo, {
            periodo: r.periodo,
            empleados: 0,
            salario_base: 0,
            ingresos: 0,
            deducciones: 0,
            neto: 0
          });
        }
        const item = byPeriodo.get(r.periodo);
        item.empleados += 1;
        item.salario_base += r.salario_base;
        item.ingresos += r.ingresos;
        item.deducciones += r.deducciones;
        item.neto += r.neto;
      }
      rows = Array.from(byPeriodo.values());
    }

    res.json({
      tipo,
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
            logoBase64: empresa.logo ? `data:${empresa.logo_mime};base64,${empresa.logo.toString('base64')}` : null
          }
        : null,
      meta: {
        periodo:
          tipo === 'anual_general'
            ? `Año ${year}`
            : periodoSeleccionado?.periodo || 'N/A',
        area: areaSeleccionada?.area || 'Todas',
        total_empleados: baseRows.length,
        fecha_generacion: new Date().toISOString()
      },
      resumen: resumenBase,
      rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
