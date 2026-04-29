const express = require('express');
const router = express.Router();
const { authenticateToken, isKendrapramukh, isHeadmaster } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', authenticateToken, eventController.getAllEvents);

// Get event statistics (Admin only)
router.get('/stats', authenticateToken, isKendrapramukh, eventController.getEventStats);

// Get single event
router.get('/:id', authenticateToken, eventController.getEventById);

// Create new event (Admin only)
router.post('/', 
  authenticateToken, 
  isKendrapramukh,
  uploadMultiple('photos', 5),
  handleUploadError,
  eventController.createEvent
);

// Submit event completion (Headmaster only)
router.post('/:id/submit', 
  authenticateToken, 
  isHeadmaster,
  uploadMultiple('photos', 5),
  handleUploadError,
  eventController.submitEvent
);

// Update event (Admin only)
router.put('/:id', authenticateToken, isKendrapramukh, eventController.updateEvent);

// Delete event (Admin only)
router.delete('/:id', authenticateToken, isKendrapramukh, eventController.deleteEvent);

module.exports = router;
