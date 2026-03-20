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
    if (err) return res.status(400).json({ error: err.message });

    try {
      let logoBuffer = null;
      let logoMime = null;

      if (req.file) {
        logoBuffer = req.file.buffer;   // directo desde memoria
        logoMime = req.file.mimetype;
      }

      const nuevaEmpresa = await Infoempresa.create({
        ...req.body,
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
    if (err) return res.status(400).json({ error: err.message });

    try {
      const empresa = await Infoempresa.findByPk(req.params.id);
      if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

      let logoBuffer = empresa.logo;
      let logoMime = empresa.logo_mime;

      if (req.file) {
        logoBuffer = req.file.buffer;   // directo desde memoria
        logoMime = req.file.mimetype;
      }

      await empresa.update({
        ...req.body,
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
