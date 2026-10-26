/**
 * Notification Controller
 * Fetches user notifications and marks them as read.
 */
const Notification = require('../models/Notification');

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification (or all) as read
// @route   PUT /api/notifications/read
// @access  Private
const markNotificationsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: req.user._id },
        { isRead: true }
      );
    } else {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
      );
    }

    res.json({
      success: true,
      message: 'Notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markNotificationsRead,
};
