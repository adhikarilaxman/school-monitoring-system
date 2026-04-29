const express = require('express');
const router = express.Router();
const { authenticateToken, isKendrapramukh, isHeadmaster } = require('../middleware/auth');
const meetingController = require('../controllers/meetingController');

// Get all meetings
router.get('/', authenticateToken, meetingController.getAllMeetings);

// Get meeting statistics (Admin only)
router.get('/stats', authenticateToken, isKendrapramukh, meetingController.getMeetingStats);

// Get single meeting
router.get('/:id', authenticateToken, meetingController.getMeetingById);

// Create new meeting (Admin only)
router.post('/', authenticateToken, isKendrapramukh, meetingController.createMeeting);

// Respond to meeting (Headmaster only)
router.post('/:id/respond', authenticateToken, isHeadmaster, meetingController.respondToMeeting);

// Update meeting (Admin only)
router.put('/:id', authenticateToken, isKendrapramukh, meetingController.updateMeeting);

// Delete meeting (Admin only)
router.delete('/:id', authenticateToken, isKendrapramukh, meetingController.deleteMeeting);

module.exports = router;
