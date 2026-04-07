const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole('Administrador'));

router.get('/', usuariosController.getAll);
router.get('/:id', usuariosController.getById);
router.post('/', usuariosController.create);
router.put('/:id', usuariosController.update);
router.delete('/:id', usuariosController.delete);

module.exports = router;