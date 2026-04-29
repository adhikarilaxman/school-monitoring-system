const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public routes - no authentication required

// Get all schools (public view)
router.get('/schools', publicController.getPublicSchools);

// Get single school details
router.get('/schools/:id', publicController.getPublicSchoolById);

// Get programs gallery
router.get('/programs', publicController.getProgramsGallery);

// Get toppers list
router.get('/toppers', publicController.getToppers);

// Get attendance summary (view only)
router.get('/attendance', publicController.getPublicAttendance);

// Get public stats
router.get('/stats', publicController.getPublicStats);

// Search functionality
router.get('/search', publicController.searchPublic);

module.exports = router;
