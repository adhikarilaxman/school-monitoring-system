const jwt = require('jsonwebtoken');
const dataStore = require('../models/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'scholastic_archive_secret_key_2024';

// Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = dataStore.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      schoolId: user.schoolId,
      schoolName: user.schoolName
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Check if user is Kendrapramukh (Admin)
const isKendrapramukh = (req, res, next) => {
  if (req.user.role !== 'kendrapramukh') {
    return res.status(403).json({ message: 'Kendrapramukh access required' });
  }
  next();
};

// Check if user is Headmaster
const isHeadmaster = (req, res, next) => {
  if (req.user.role !== 'headmaster') {
    return res.status(403).json({ message: 'Headmaster access required' });
  }
  next();
};

// Check if user is either Kendrapramukh or Headmaster
const isAuthorized = (req, res, next) => {
  if (req.user.role !== 'kendrapramukh' && req.user.role !== 'headmaster') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  next();
};

// Check if headmaster can only access their own school data
const restrictToOwnSchool = (req, res, next) => {
  if (req.user.role === 'kendrapramukh') {
    return next(); // Admin can access all
  }
  
  if (req.user.role === 'headmaster') {
    const requestedSchoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
    
    if (requestedSchoolId && requestedSchoolId !== req.user.schoolId) {
      return res.status(403).json({ message: 'You can only access your own school data' });
    }
    
    // Attach schoolId to request if not provided
    req.schoolId = req.user.schoolId;
  }
  
  next();
};

module.exports = {
  authenticateToken,
  isKendrapramukh,
  isHeadmaster,
  isAuthorized,
  restrictToOwnSchool,
  JWT_SECRET
};
