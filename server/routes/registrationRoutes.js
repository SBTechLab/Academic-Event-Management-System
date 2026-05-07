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
    authorizeRole(['admin', 'faculty', 'student_coordinator', 'student']),
    registrationController.getEventRegistrations
);

router.put(
    '/:id/approve-coordinator',
    authorizeRole(['admin', 'faculty']),
    (req, res) => {
        req.body.status = 'registered';
        req.body.coordinator_permissions = req.body.permissions;
        registrationController.updateRegistrationStatus(req, res);
    }
);

// Used by FacultyDashboard (approve coordinator) and CoordinatorDashboard (mark attendance)
router.put(
    '/:id/status',
    authorizeRole(['admin', 'faculty', 'student_coordinator', 'student']),
    registrationController.updateRegistrationStatus
);

module.exports = router;
