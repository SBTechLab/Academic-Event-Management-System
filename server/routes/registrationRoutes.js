const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { protect } = require('../middleware/jwtMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

router.use(protect);

// Student routes
router.post('/', authorizeRole(['student', 'student_coordinator']), registrationController.registerForEvent);
router.get('/my-registrations', authorizeRole(['student', 'student_coordinator']), registrationController.getMyRegistrations);
router.get('/check/:eventId', authorizeRole(['student', 'student_coordinator']), registrationController.checkRegistration);

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
