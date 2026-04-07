const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole(['Administrador', 'RRHH']));

router.get('/activos', empleadosController.getActivos);

router.get('/', empleadosController.getAll);
router.get('/:id', empleadosController.getById);
router.post('/', empleadosController.create);
router.put('/:id', empleadosController.update);
router.delete('/:id', empleadosController.delete);

module.exports = router;