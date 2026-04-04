const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/config', reportesController.getConfig);
router.get('/generar', reportesController.generar);

module.exports = router;
