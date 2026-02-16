const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/jwtMiddleware');
const {
    requestCoordinator,
    getPendingRequests,
    reviewRequest,
    getMyRequest
} = require('../controllers/coordinatorRequestController');

// Student routes
router.post('/', protect, requestCoordinator);
router.get('/my-request', protect, getMyRequest);

// Faculty/Admin routes  
router.get('/pending', protect, getPendingRequests);
router.put('/:id', protect, reviewRequest);

module.exports = router;