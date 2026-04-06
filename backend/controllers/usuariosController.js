const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require('../models');
const { Op } = require('sequelize');

const usuarioRegex = /^[a-zA-Z0-9@_]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,30}$/;
const safeUsuarioAttributes = { exclude: ['clave_hash'] };

function getAuthPayload(req) {
  if (req.user) return req.user;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) {
    return null;
  }
}

function getAuthUserId(req) {
  const payload = getAuthPayload(req);
  const id = Number(payload?.id ?? payload?.id_usuario);
  return Number.isFinite(id) ? id : null;
}

async function getAdminRoleId() {
  const adminRole = await Rol.findOne({
    where: { rol: 'Administrador' },
    attributes: ['id_rol']
  });
  return adminRole ? Number(adminRole.id_rol) : null;
}

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: safeUsuarioAttributes,
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
      attributes: safeUsuarioAttributes,
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

    if (!usuario || typeof usuario !== 'string') {
      return res.status(400).json({ error: 'El usuario es requerido' });
    }
    if (usuario.length < 5 || usuario.length > 40 || !usuarioRegex.test(usuario)) {
      return res.status(400).json({ error: 'Usuario inválido. Debe tener 5-40 caracteres y usar solo letras, números, arroba (@) y guion bajo (_)' });
    }
    if (!clave || typeof clave !== 'string' || !passwordRegex.test(clave)) {
      return res.status(400).json({ error: 'La clave debe tener 8-30 caracteres, incluyendo mayúscula, minúscula, número y símbolo' });
    }
    if (!id_rol || !Number.isFinite(Number(id_rol))) {
      return res.status(400).json({ error: 'Debe seleccionar un rol válido' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { usuario } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese nombre' });
    }

    const hashedPassword = bcrypt.hashSync(clave, 10);

    const nuevoUsuario = await Usuario.create({
      usuario,
      clave_hash: hashedPassword,
      estado: estado || 'Activo',
      id_rol
    });

    const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id_usuario, {
      attributes: safeUsuarioAttributes,
      include: [{ model: Rol, attributes: ['id_rol', 'rol'] }]
    });
    res.status(201).json(usuarioCreado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ error: 'Token inválido o no proporcionado' });
    }

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { usuario: nombre, clave, id_rol } = req.body;

    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ error: 'El usuario es requerido' });
    }
    if (nombre.length < 5 || nombre.length > 40 || !usuarioRegex.test(nombre)) {
      return res.status(400).json({ error: 'Usuario inválido. Debe tener 5-40 caracteres y usar solo letras, números, arroba (@) y guion bajo (_)' });
    }
    if (!id_rol || !Number.isFinite(Number(id_rol))) {
      return res.status(400).json({ error: 'Debe seleccionar un rol válido' });
    }
    if (clave && (typeof clave !== 'string' || !passwordRegex.test(clave))) {
      return res.status(400).json({ error: 'La clave debe tener 8-30 caracteres, incluyendo mayúscula, minúscula, número y símbolo' });
    }

    const usuarioExistente = await Usuario.findOne({
      where: {
        usuario: nombre,
        id_usuario: { [Op.ne]: usuario.id_usuario }
      }
    });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese nombre' });
    }

    const adminRoleId = await getAdminRoleId();
    if (adminRoleId && Number(usuario.id_rol) === adminRoleId && Number(id_rol) !== adminRoleId) {
      if (authUserId === Number(usuario.id_usuario)) {
        return res.status(400).json({ error: 'No puede degradar su propio usuario administrador' });
      }

      const adminsActivosRestantes = await Usuario.count({
        where: {
          id_rol: adminRoleId,
          estado: 'Activo',
          id_usuario: { [Op.ne]: usuario.id_usuario }
        }
      });
      if (adminsActivosRestantes < 1) {
        return res.status(400).json({ error: 'No se puede degradar al último administrador activo del sistema' });
      }
    }

    const dataToUpdate = { usuario: nombre, estado: 'Activo', id_rol };

    if (clave) {
      dataToUpdate.clave_hash = bcrypt.hashSync(clave, 10);
    }

    await usuario.update(dataToUpdate);
    const usuarioActualizado = await Usuario.findByPk(usuario.id_usuario, {
      attributes: safeUsuarioAttributes,
      include: [{ model: Rol, attributes: ['id_rol', 'rol'] }]
    });
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
    try {
      const authUserId = getAuthUserId(req);
      if (!authUserId) {
        return res.status(401).json({ error: 'Token inválido o no proporcionado' });
      }

      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (authUserId === Number(usuario.id_usuario)) {
        return res.status(400).json({ error: 'Error al inactivar usuario, no puede auto-inactivarse' });
      }

      const adminRoleId = await getAdminRoleId();
      if (adminRoleId && Number(usuario.id_rol) === adminRoleId && usuario.estado === 'Activo') {
        const adminsActivosRestantes = await Usuario.count({
          where: {
            id_rol: adminRoleId,
            estado: 'Activo',
            id_usuario: { [Op.ne]: usuario.id_usuario }
          }
        });
        if (adminsActivosRestantes < 1) {
          return res.status(400).json({ error: 'No se puede inactivar al último administrador activo del sistema' });
        }
      }
  
      await usuario.update({ estado: 'Inactivo' });
      res.json({ message: 'Usuario marcado como Inactivo' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };