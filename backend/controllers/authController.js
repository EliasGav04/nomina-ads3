const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const user = req.user; 
  const payload = {
    id: user.id_usuario,
    usuario: user.usuario,
    role: user.Rol.nombre
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });

  res.json({ message: "Login exitoso", token });
};

exports.logout = (req, res) => {
  //frontend borra el token.
  res.json({ message: "Logout exitoso, borra el token en frontend" });
};