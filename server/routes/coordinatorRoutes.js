const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/jwtMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const {
  applyForCoordinator,
  getAllApplications,
  getMyApplication,
  reviewApplication
} = require('../controllers/coordinatorController');

router.post('/apply', protect, authorizeRole(['student']), applyForCoordinator);
router.get('/applications', protect, authorizeRole(['admin', 'faculty']), getAllApplications);
router.get('/my-application', protect, getMyApplication);
router.patch('/applications/:id', protect, authorizeRole(['admin', 'faculty']), reviewApplication);

module.exports = router;
