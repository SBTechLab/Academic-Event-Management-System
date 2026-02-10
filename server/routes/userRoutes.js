const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/jwtMiddleware');

// Public routes
router.post('/login', userController.loginUser);
router.post('/signup', userController.registerUser);

// Protected routes
router.use(protect);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;
