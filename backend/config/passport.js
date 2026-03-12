const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { Usuario, Rol } = require("../models");

module.exports = (passport) => {
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await Usuario.findOne({ where: { usuario: username }, include: Rol });
      if (!user) {
        return done(null, false, { status: 404, message: "Usuario no encontrado" });
      }
  
      if (user.estado === "Inactivo") {
        return done(null, false, { status: 403, message: "Usuario inactivo" });
      }
  
      const match = await bcrypt.compare(password, user.clave_hash);
      if (!match) {
        return done(null, false, { status: 401, message: "Contraseña incorrecta" });
      }
  
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id_usuario));
  passport.deserializeUser(async (id, done) => {
    const user = await Usuario.findByPk(id, { include: Rol });
    done(null, user);
  });
};
