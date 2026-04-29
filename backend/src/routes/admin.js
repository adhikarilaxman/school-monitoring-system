const express = require('express');
const router = express.Router();
const { authenticateToken, isKendrapramukh } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(authenticateToken, isKendrapramukh);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// School management
router.get('/schools', adminController.getAllSchools);
router.post('/schools', adminController.createSchool);
router.put('/schools/:id', adminController.updateSchool);
router.delete('/schools/:id', adminController.deleteSchool);

// Dashboard stats
router.get('/stats', adminController.getStats);

module.exports = router;
