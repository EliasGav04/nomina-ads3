const jwt = require("jsonwebtoken");
const passport = require("passport");

exports.login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (!user) {
      const status = info?.status || 401;
      return res.status(status).json({ message: info?.message || "Credenciales inválidas" });
    }

    //generar token si el usuario es válido
    const payload = {
      id: user.id_usuario,
      usuario: user.usuario,
      role: user.Rol.nombre
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES
    });

    return res.json({ message: "Login exitoso", token });
  })(req, res, next);
};

exports.logout = (req, res) => {
  res.json({ message: "Logout exitoso, borra el token en frontend" });
};