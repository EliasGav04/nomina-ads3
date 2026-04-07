const jwt = require("jsonwebtoken");

function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = user;
    next();
  });
}

function checkRole(role) {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (req.user && allowedRoles.includes(req.user.role)) return next();
    res.status(403).json({ message: "Acceso denegado" });
  };
}

module.exports = { ensureAuthenticated, checkRole };