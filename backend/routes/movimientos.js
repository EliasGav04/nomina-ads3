const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole(['Administrador', 'RRHH']));

router.get('/', movimientosController.getAll);
router.get('/:id', movimientosController.getById);
router.post('/', movimientosController.create);
router.put('/:id', movimientosController.update);
router.delete('/:id', movimientosController.delete);

module.exports = router;