const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/recommend', aiController.recommend);
router.post('/explain-recovery', aiController.explainRecovery);

module.exports = router;
