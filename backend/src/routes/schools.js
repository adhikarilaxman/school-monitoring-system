const express = require('express');
const router = express.Router();
const { authenticateToken, isKendrapramukh, isHeadmaster, restrictToOwnSchool } = require('../middleware/auth');
const schoolController = require('../controllers/schoolController');

// Get all schools (Admin only)
router.get('/', authenticateToken, isKendrapramukh, schoolController.getAllSchools);

// Get school statistics (Admin only)
router.get('/stats', authenticateToken, isKendrapramukh, schoolController.getSchoolStats);

// Get headmaster's own school
router.get('/my-school', authenticateToken, isHeadmaster, schoolController.getMySchool);

// Get single school (with authorization)
router.get('/:id', authenticateToken, restrictToOwnSchool, schoolController.getSchoolById);

// Update school (Admin only)
router.put('/:id', authenticateToken, isKendrapramukh, schoolController.updateSchool);

module.exports = router;
