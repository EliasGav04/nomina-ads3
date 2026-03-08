const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const sequelize = require('./config/database');

const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());


app.get('/', (req, res) => {
  res.send('API funcionando');
});

//conexion BD
sequelize.authenticate()
  .then(() => {
    console.log('Conectado a BD');
  })
  .catch(err => {
    console.error('Error conectando a BD', err);
  });


//levantar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});