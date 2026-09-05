const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

router.post('/connection', riskController.calculateRisk);

module.exports = router;
