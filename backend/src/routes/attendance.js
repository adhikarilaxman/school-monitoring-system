const express = require('express');
const router = express.Router();
const { authenticateToken, isKendrapramukh, isHeadmaster } = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

// Get all schools attendance summary (Admin only)
router.get('/summary', authenticateToken, isKendrapramukh, attendanceController.getAllAttendanceSummary);

// Get attendance trends (Admin only)
router.get('/trends', authenticateToken, isKendrapramukh, attendanceController.getAttendanceTrends);

// Get headmaster's own school attendance
router.get('/my-attendance', authenticateToken, isHeadmaster, attendanceController.getMyAttendance);

// Mark daily attendance (Headmaster only)
router.post('/', authenticateToken, isHeadmaster, attendanceController.markDailyAttendance);

// Get attendance for specific school
router.get('/:schoolId', authenticateToken, attendanceController.getSchoolAttendance);

// Update attendance
router.put('/:schoolId', authenticateToken, attendanceController.updateAttendance);

module.exports = router;
