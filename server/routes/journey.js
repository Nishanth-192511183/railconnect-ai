const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/plan', journeyController.plan);
router.post('/select', optionalAuth, journeyController.select);
router.get('/:id', journeyController.getById);
router.post('/:id/track', journeyController.track);
router.post('/:id/simulate-delay', journeyController.simulateDelay);

module.exports = router;
