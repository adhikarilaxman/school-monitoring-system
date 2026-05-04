const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use /tmp for Vercel serverless, local uploads for development
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const baseUploadDir = isVercel ? '/tmp/uploads' : path.join(__dirname, '..', '..', 'uploads');

// Ensure upload directories exist
const uploadDirs = {
  gr: path.join(baseUploadDir, 'gr'),
  events: path.join(baseUploadDir, 'events'),
  schools: path.join(baseUploadDir, 'schools'),
  meetings: path.join(baseUploadDir, 'meetings'),
  reports: path.join(baseUploadDir, 'reports'),
  users: path.join(baseUploadDir, 'users'),
  staff: path.join(baseUploadDir, 'staff'),
  toppers: path.join(baseUploadDir, 'toppers')
};

// Create base directory first
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on route
    let dir = uploadDirs.reports;
    
    if (req.originalUrl?.includes('/grs')) {
      dir = uploadDirs.gr;
    } else if (req.originalUrl?.includes('/events')) {
      dir = uploadDirs.events;
    } else if (req.originalUrl?.includes('/schools')) {
      dir = uploadDirs.schools;
    } else if (req.originalUrl?.includes('/meetings')) {
      dir = uploadDirs.meetings;
    } else if (req.originalUrl?.includes('/reports')) {
      dir = uploadDirs.reports;
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter - more permissive for production
const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: images, PDF, Word, Excel, CSV`), false);
  }
};

// Upload configurations
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Multiple file upload handler
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Single file upload handler
const uploadSingle = (fieldName) => upload.single(fieldName);

// Mixed upload (fields)
const uploadFields = (fields) => upload.fields(fields);

// Error handler
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Too many files uploaded' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
  uploadDirs
};
