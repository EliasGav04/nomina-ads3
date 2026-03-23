const express = require('express');
const router = express.Router();
const areasController = require('../controllers/areasController');

router.get('/', areasController.getAll);
router.get('/:id', areasController.getById);
router.post('/', areasController.create);
router.put('/:id', areasController.update);
router.delete('/:id', areasController.delete);

module.exports = router;