const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/jwtMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.use(protect);

router.post(
    '/',
    authorizeRole(['admin', 'faculty']),
    eventController.createEvent
);

router.put(
    '/:id',
    authorizeRole(['admin', 'faculty']),
    eventController.updateEvent
);

router.delete(
    '/:id',
    authorizeRole(['admin', 'faculty']),
    eventController.deleteEvent
);

module.exports = router;
