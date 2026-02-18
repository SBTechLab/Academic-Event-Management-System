const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/jwtMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

// Public routes
router.post('/login', userController.loginUser);
router.post('/signup', userController.registerUser);

// Protected routes
router.use(protect);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Admin only routes
router.get('/faculty', authorizeRole(['admin']), userController.getAllFaculty);
router.delete('/faculty/:id', authorizeRole(['admin']), userController.removeFaculty);

module.exports = router;
