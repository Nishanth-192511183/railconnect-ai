const express = require('express');
const router = express.Router();
const recoveryController = require('../controllers/recoveryController');

router.post('/check', recoveryController.check);
router.post('/generate', recoveryController.generate);

module.exports = router;
