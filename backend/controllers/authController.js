const jwt = require("jsonwebtoken");
const passport = require("passport");

exports.login = (req, res, next) => {
  passport.authenticate("local", { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (!user) {
      const status = info?.status || 401;
      return res.status(status).json({ message: info?.message || "Credenciales inválidas" });
    }

    //bloquear si usuario inactivo
    if (user.estado !== "Activo") {
      return res.status(403).json({ message: "Usuario inactivo, acceso denegado" });
    }

    try {
      //actualizar ultimo acceso
      user.ultimo_acceso = new Date();
      await user.save();

      // generar JWT token
      const payload = {
        id: user.id_usuario,
        usuario: user.usuario,
        role: user.Rol.rol
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
      });

      return res.json({ message: "Login exitoso", token, usuario: user });
    } catch (error) {
      return res.status(500).json({ message: "Error al actualizar último acceso" });
    }
  })(req, res, next);
};

exports.logout = (req, res) => {
  res.json({ message: "Logout exitoso, borra el token en frontend" });
};