const bcrypt = require("bcrypt");
const { Usuario, Rol } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [{ model: Rol, attributes: ['id_rol', 'rol'] }]
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Rol, attributes: ['id_rol', 'rol'] }]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { usuario, clave, estado, id_rol } = req.body;

    const hashedPassword = bcrypt.hashSync(clave, 10);

    const nuevoUsuario = await Usuario.create({
      usuario,
      clave_hash: hashedPassword,
      estado: estado || 'Activo',
      id_rol
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { usuario: nombre, clave, id_rol } = req.body;

    const dataToUpdate = { usuario: nombre, estado: 'Activo', id_rol };

    if (clave) {
      dataToUpdate.clave_hash = bcrypt.hashSync(clave, 10);
    }

    await usuario.update(dataToUpdate);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      await usuario.update({ estado: 'Inactivo' });
      res.json({ message: 'Usuario marcado como Inactivo' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };