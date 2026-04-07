const express = require('express');
const router = express.Router();
const boletapagoController = require('../controllers/boletapagoController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole(['Administrador', 'RRHH', 'Consultor']));

router.get('/filtros', boletapagoController.getFiltros);
router.get('/', boletapagoController.getBoleta);

module.exports = router;
