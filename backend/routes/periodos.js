const express = require('express');
const router = express.Router();
const periodosController = require('../controllers/periodosController');
const { checkRole } = require('../middleware/auth');

router.use(checkRole(['Administrador', 'RRHH']));

router.get('/abiertos', periodosController.getAbiertos);

router.get('/', periodosController.getAll);
router.get('/:id', periodosController.getById);
router.post('/', periodosController.create);
router.put('/:id', periodosController.update);
router.delete('/:id', periodosController.delete);


module.exports = router;
