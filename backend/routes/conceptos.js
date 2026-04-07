const express = require('express');
const router = express.Router();
const conceptosController = require('../controllers/conceptosController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole(['Administrador', 'RRHH']));

router.get('/manuales-activos', conceptosController.getManualesActivos);

router.get('/', conceptosController.getAll);
router.get('/:id', conceptosController.getById);
router.post('/', conceptosController.create);
router.put('/:id', conceptosController.update);
router.delete('/:id', conceptosController.delete);




module.exports = router;