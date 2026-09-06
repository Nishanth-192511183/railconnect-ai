const express = require('express');
const router = express.Router();

const journeyController = require('../controllers/journeyController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post(
  '/plan',
  express.json(),
  (req, res, next) => {
    console.log('JOURNEY BODY:', req.body);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'JSON body was not received by journey route'
      });
    }

    next();
  },
  journeyController.plan
);
/*
 * Explicitly parse JSON for journey requests.
 * This guarantees req.body is available for these routes.
 */

router.post(
  '/plan',
  express.json(),
  journeyController.plan
);

router.post(
  '/select',
  express.json(),
  optionalAuth,
  journeyController.select
);

router.get(
  '/:id',
  journeyController.getById
);

router.post(
  '/:id/track',
  express.json(),
  journeyController.track
);

router.post(
  '/:id/simulate-delay',
  express.json(),
  journeyController.simulateDelay
);

module.exports = router;