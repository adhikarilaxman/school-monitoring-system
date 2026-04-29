const dataStore = require('../models/dataStore');
const { v4: uuidv4 } = require('uuid');

// Get notifications for current user
const getNotifications = (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    
    let notifications = dataStore.notifications.filter(n => n.userId === req.user.id);

    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit results
    notifications = notifications.slice(0, parseInt(limit));

    const unreadCount = dataStore.notifications.filter(
      n => n.userId === req.user.id && !n.read
    ).length;

    res.json({
      notifications,
      unreadCount,
      total: dataStore.notifications.filter(n => n.userId === req.user.id).length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Mark notification as read
const markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    const notification = dataStore.notifications.find(
      n => n.id === id && n.userId === req.user.id
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date().toISOString();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = (req, res) => {
  try {
    const userNotifications = dataStore.notifications.filter(
      n => n.userId === req.user.id && !n.read
    );

    userNotifications.forEach(n => {
      n.read = true;
      n.readAt = new Date().toISOString();
    });

    res.json({ 
      message: 'All notifications marked as read',
      count: userNotifications.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications as read', error: error.message });
  }
};

// Delete notification
const deleteNotification = (req, res) => {
  try {
    const { id } = req.params;
    const index = dataStore.notifications.findIndex(
      n => n.id === id && n.userId === req.user.id
    );

    if (index === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    dataStore.notifications.splice(index, 1);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

// Get notification count (for badge)
const getUnreadCount = (req, res) => {
  try {
    const count = dataStore.notifications.filter(
      n => n.userId === req.user.id && !n.read
    ).length;

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notification count', error: error.message });
  }
};

// Create notification (internal use)
const createNotification = (req, res) => {
  try {
    // Only admin can create notifications directly
    if (req.user.role !== 'kendrapramukh') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId, type, title, message, relatedId, relatedType } = req.body;

    if (!userId || !type || !title) {
      return res.status(400).json({ message: 'UserId, type, and title are required' });
    }

    dataStore.addNotification({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType
    });

    res.status(201).json({ message: 'Notification created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};

// Notify all headmasters about admin action
const notifyAllHeadmasters = (type, title, message, relatedId = null, relatedType = null) => {
  const headmasters = dataStore.users.filter(u => u.role === 'headmaster');
  
  headmasters.forEach(hm => {
    dataStore.addNotification({
      userId: hm.id,
      type,
      title,
      message,
      relatedId,
      relatedType
    });
  });
  
  return headmasters.length;
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  notifyAllHeadmasters
};
