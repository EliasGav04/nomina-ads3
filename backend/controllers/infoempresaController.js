const { Infoempresa } = require('../models');
const multer = require('multer');

// Configuración de multer para memoria 
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no permitido'), false);
    }
  }
}).single('logo');

const namePattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9.,()'"\-&\s]+$/;
const direccionPattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9.,()'"#\-/&\s]+$/;
const rtnPattern = /^\d{14}$/;
const telefonoPattern = /^\+504 \d{4}-\d{4}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const webPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
const monedaPattern = /^[A-Z]{3}$/;

function sanitize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateEmpresaPayload(payload) {
  const nombre = sanitize(payload.nombre);
  const razon_social = sanitize(payload.razon_social);
  const rtn = sanitize(payload.rtn);
  const direccion = sanitize(payload.direccion);
  const telefono = sanitize(payload.telefono);
  const correo = sanitize(payload.correo);
  const sitio_web = sanitize(payload.sitio_web);
  const codigo_moneda = sanitize(payload.codigo_moneda).toUpperCase() || 'HNL';

  if (!nombre || nombre.length < 3 || nombre.length > 100 || !namePattern.test(nombre)) {
    return { ok: false, error: 'Nombre inválido. Debe tener entre 3 y 100 caracteres.' };
  }
  if (!razon_social || razon_social.length < 3 || razon_social.length > 150 || !namePattern.test(razon_social)) {
    return { ok: false, error: 'Razón social inválida. Debe tener entre 3 y 150 caracteres.' };
  }
  if (!rtnPattern.test(rtn)) {
    return { ok: false, error: 'RTN inválido. Debe contener exactamente 14 dígitos.' };
  }
  if (!direccion || direccion.length < 10 || direccion.length > 250 || !direccionPattern.test(direccion)) {
    return { ok: false, error: 'Dirección inválida. Debe tener entre 10 y 250 caracteres.' };
  }
  if (!telefonoPattern.test(telefono)) {
    return { ok: false, error: 'Teléfono inválido. Use el formato +504 0000-0000.' };
  }
  if (!correo || correo.length > 150 || !emailPattern.test(correo)) {
    return { ok: false, error: 'Correo electrónico inválido.' };
  }
  if (sitio_web && (sitio_web.length > 150 || !webPattern.test(sitio_web))) {
    return { ok: false, error: 'Sitio web inválido.' };
  }
  if (!monedaPattern.test(codigo_moneda)) {
    return { ok: false, error: 'Código de moneda inválido. Debe usar formato ISO de 3 letras (ej: HNL, USD, GTQ).' };
  }

  return {
    ok: true,
    data: {
      nombre,
      razon_social,
      rtn,
      direccion,
      telefono,
      correo,
      sitio_web: sitio_web || null,
      codigo_moneda
    }
  };
}




exports.getAll = async (req, res) => {
  try {
    const empresas = await Infoempresa.findAll();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
    try {
      const empresa = await Infoempresa.findByPk(req.params.id);
      if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
  
      let empresaJson = empresa.toJSON();
  
      if (empresa.logo) {
        empresaJson.logoBase64 = `data:${empresa.logo_mime};base64,${empresa.logo.toString('base64')}`;
      }
  
      res.json(empresaJson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.create = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El logo excede el tamaño permitido (máximo 5 MB).' });
      }
      return res.status(400).json({ error: err.message });
    }

    try {
      const validation = validateEmpresaPayload(req.body);
      if (!validation.ok) return res.status(400).json({ error: validation.error });

      let logoBuffer = null;
      let logoMime = null;

      if (req.file) {
        logoBuffer = req.file.buffer;   // directo desde memoria
        logoMime = req.file.mimetype;
      }

      const nuevaEmpresa = await Infoempresa.create({
        ...validation.data,
        logo: logoBuffer,
        logo_mime: logoMime
      });

      res.status(201).json(nuevaEmpresa);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

exports.update = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El logo excede el tamaño permitido (máximo 5 MB).' });
      }
      return res.status(400).json({ error: err.message });
    }

    try {
      const validation = validateEmpresaPayload(req.body);
      if (!validation.ok) return res.status(400).json({ error: validation.error });

      const empresa = await Infoempresa.findByPk(req.params.id);
      if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

      let logoBuffer = empresa.logo;
      let logoMime = empresa.logo_mime;

      if (req.file) {
        logoBuffer = req.file.buffer;   // directo desde memoria
        logoMime = req.file.mimetype;
      }

      await empresa.update({
        ...validation.data,
        logo: logoBuffer,
        logo_mime: logoMime
      });

      res.json(empresa);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

exports.delete = async (req, res) => {
  try {
    const empresa = await Infoempresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    await empresa.destroy();
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
