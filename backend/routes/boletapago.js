const express = require('express');
const router = express.Router();
const boletapagoController = require('../controllers/boletapagoController');

router.get('/filtros', boletapagoController.getFiltros);
router.get('/', boletapagoController.getBoleta);

module.exports = router;
