const dataStore = require('../models/dataStore');

// Get all schools (Admin only)
const getAllSchools = (req, res) => {
  try {
    const schools = dataStore.schools.map(school => ({
      id: school.id,
      name: school.name,
      udise: school.udise,
      address: school.address,
      contact: school.contact,
      email: school.email,
      headmasterName: school.headmasterName,
      type: school.type,
      staff: school.staff,
      facilities: school.facilities,
      photo: school.photo,
      established: school.established
    }));

    res.json({ schools, count: schools.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schools', error: error.message });
  }
};

// Get single school by ID
const getSchoolById = (req, res) => {
  try {
    const { id } = req.params;
    const school = dataStore.getSchoolById(id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check authorization for headmasters
    if (req.user.role === 'headmaster' && req.user.schoolId !== id) {
      return res.status(403).json({ message: 'You can only access your own school data' });
    }

    res.json(school);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch school', error: error.message });
  }
};

// Get school statistics (Admin only)
const getSchoolStats = (req, res) => {
  try {
    const stats = {
      totalSchools: dataStore.schools.length,
      byType: {},
      totalStaff: { teachers: 0, admin: 0, support: 0 },
      byZone: {}
    };

    dataStore.schools.forEach(school => {
      // Count by type
      stats.byType[school.type] = (stats.byType[school.type] || 0) + 1;
      
      // Count staff
      stats.totalStaff.teachers += school.staff.teachers;
      stats.totalStaff.admin += school.staff.admin;
      stats.totalStaff.support += school.staff.support;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch school stats', error: error.message });
  }
};

// Get headmaster's school (for headmaster role)
const getMySchool = (req, res) => {
  try {
    if (req.user.role !== 'headmaster' || !req.user.schoolId) {
      return res.status(403).json({ message: 'Headmaster access required' });
    }

    const school = dataStore.getSchoolById(req.user.schoolId);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch school', error: error.message });
  }
};

// Update school (Admin only)
const updateSchool = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const school = dataStore.schools.find(s => s.id === id);
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Only allow specific fields to be updated
    const allowedUpdates = ['contact', 'email', 'facilities', 'photo'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        school[field] = updates[field];
      }
    });

    res.json({ message: 'School updated successfully', school });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update school', error: error.message });
  }
};

module.exports = {
  getAllSchools,
  getSchoolById,
  getSchoolStats,
  getMySchool,
  updateSchool
};
