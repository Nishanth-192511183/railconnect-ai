const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');

router.get('/search', trainController.search);
router.get('/:trainId/status', trainController.getStatus);

module.exports = router;
