const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
require('dotenv').config();

const sequelize = require('./config/database');

require('./config/passport')(passport);

//rutas backend
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const rolesRoutes = require('./routes/roles');
const infoempresaRoutes = require('./routes/infoempresa');

const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
  res.send('API funcionando');
});

// rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/infoempresa', infoempresaRoutes);

//conexion BD
sequelize.authenticate()
  .then(() => console.log('Conectado a BD'))
  .catch(err => console.error('Error conectando a BD', err));

//levantar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
