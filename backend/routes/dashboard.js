const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole(['Administrador', 'RRHH', 'Consultor']));

router.get('/resumen', dashboardController.getResumen);

module.exports = router;
