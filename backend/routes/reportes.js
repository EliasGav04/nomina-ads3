const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole(['Administrador', 'RRHH', 'Consultor']));

router.get('/config', reportesController.getConfig);
router.get('/generar', reportesController.generar);

module.exports = router;
