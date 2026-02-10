const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { protect } = require('../middleware/jwtMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

router.use(protect);

// Student routes
router.post('/', authorizeRole(['student']), registrationController.registerForEvent);
router.get('/my', authorizeRole(['student']), registrationController.getMyRegistrations);

// Coordinator/Faculty routes
router.get(
    '/event/:eventId',
    authorizeRole(['admin', 'faculty', 'student_coordinator']),
    registrationController.getEventRegistrations
);

router.put(
    '/:id/status',
    authorizeRole(['admin', 'faculty', 'student_coordinator']),
    registrationController.updateRegistrationStatus
);

module.exports = router;
