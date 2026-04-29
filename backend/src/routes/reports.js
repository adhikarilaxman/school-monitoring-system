const express = require('express');
const router = express.Router();
const { authenticateToken, isKendrapramukh, isHeadmaster } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const reportController = require('../controllers/reportController');

// Get all forms
router.get('/', authenticateToken, reportController.getAllForms);

// Get forms overview (Admin only)
router.get('/overview', authenticateToken, isKendrapramukh, reportController.getFormsOverview);

// Get single form
router.get('/:id', authenticateToken, reportController.getFormById);

// Get form submission status
router.get('/:id/status', authenticateToken, reportController.getFormStatus);

// Get consolidated report data
router.get('/:id/consolidated', authenticateToken, isKendrapramukh, reportController.getConsolidatedReport);

// Create new form (Admin only)
router.post('/', authenticateToken, isKendrapramukh, reportController.createForm);

// Submit form response (Headmaster only)
router.post('/:id/submit', 
  authenticateToken, 
  isHeadmaster,
  uploadMultiple('attachments', 5),
  handleUploadError,
  reportController.submitForm
);

// Download Excel report (Admin only)
router.get('/:id/download', authenticateToken, isKendrapramukh, reportController.downloadExcel);

// Send reminder to a school (Admin only)
router.post('/:id/remind/:schoolId', authenticateToken, isKendrapramukh, reportController.sendReminder);

// Delete form (Admin only)
router.delete('/:id', authenticateToken, isKendrapramukh, reportController.deleteForm);

module.exports = router;
