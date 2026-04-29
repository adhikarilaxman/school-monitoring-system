const express = require('express');
const router = express.Router();
const { authenticateToken, isKendrapramukh, isHeadmaster } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const grController = require('../controllers/grController');

// Get all GRs
router.get('/', authenticateToken, grController.getAllGRs);

// Get GR statistics (Admin only)
router.get('/stats', authenticateToken, isKendrapramukh, grController.getGRStats);

// Get single GR
router.get('/:id', authenticateToken, grController.getGRById);

// Create new GR (Admin only)
router.post('/', 
  authenticateToken, 
  isKendrapramukh,
  uploadSingle('file'),
  handleUploadError,
  grController.createGR
);

// Mark GR as seen (Headmaster only)
router.post('/:id/seen', authenticateToken, isHeadmaster, grController.markAsSeen);

// Delete GR (Admin only)
router.delete('/:id', authenticateToken, isKendrapramukh, grController.deleteGR);

module.exports = router;
