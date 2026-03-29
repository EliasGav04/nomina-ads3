const express = require('express');
const router = express.Router();
const empleadoConceptosController = require('../controllers/empleadoConceptosController');

router.get('/', empleadoConceptosController.getAll);
router.get('/:id', empleadoConceptosController.getById);
router.post('/', empleadoConceptosController.create);
router.put('/:id', empleadoConceptosController.update);
router.delete('/:id', empleadoConceptosController.delete);

module.exports = router;
