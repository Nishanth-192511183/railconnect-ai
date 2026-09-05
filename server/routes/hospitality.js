const express = require('express');
const router = express.Router();
const hospitalityController = require('../controllers/hospitalityController');

router.get('/:station', hospitalityController.getForStation);

module.exports = router;
