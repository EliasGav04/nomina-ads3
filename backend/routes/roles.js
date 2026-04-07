const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole('Administrador'));

router.get('/', rolesController.getAll);

module.exports = router;