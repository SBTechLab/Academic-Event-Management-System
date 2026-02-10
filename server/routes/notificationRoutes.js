const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/jwtMiddleware');

router.use(protect);

router.get('/', notificationController.getMyNotifications);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
