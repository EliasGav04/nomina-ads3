const express = require('express');
const router = express.Router();
const empleadoConceptosController = require('../controllers/empleadoConceptosController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole(['Administrador', 'RRHH']));

router.get('/', empleadoConceptosController.getAll);
router.get('/:id', empleadoConceptosController.getById);
router.post('/', empleadoConceptosController.create);
router.put('/:id', empleadoConceptosController.update);
router.delete('/:id', empleadoConceptosController.delete);

module.exports = router;
