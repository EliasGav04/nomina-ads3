const express = require('express');
const router = express.Router();
const infoempresaController = require('../controllers/infoempresaController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole('Administrador'));

router.get('/', infoempresaController.getAll);
router.get('/:id', infoempresaController.getById);
router.post('/', infoempresaController.create);
router.put('/:id', infoempresaController.update);
router.delete('/:id', infoempresaController.delete);

module.exports = router;