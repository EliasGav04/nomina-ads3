const express = require('express');
const router = express.Router();
const nominaController = require('../controllers/nominaController');

router.get('/periodos-abiertos', nominaController.getPeriodosAbiertos);
router.get('/estado/:idPeriodo', nominaController.getEstadoActual);
router.get('/empleados-procesar', nominaController.getEmpleadosProcesar);
router.post('/ejecutar', nominaController.ejecutar);

module.exports = router;
