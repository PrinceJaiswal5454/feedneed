const express = require('express');
const router = express.Router();
const { getMyNotifications, markNotificationsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyNotifications);
router.put('/read', protect, markNotificationsRead);

module.exports = router;
