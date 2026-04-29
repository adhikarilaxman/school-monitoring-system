const express = require('express');
const router = express.Router();
const { authenticateToken, isKendrapramukh } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Get notifications
router.get('/', authenticateToken, notificationController.getNotifications);

// Get unread count (for badge)
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

// Mark all as read
router.put('/mark-all-read', authenticateToken, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

// Create notification (Admin only - for testing)
router.post('/', authenticateToken, isKendrapramukh, notificationController.createNotification);

module.exports = router;
