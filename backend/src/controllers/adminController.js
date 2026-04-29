const dataStore = require('../models/dataStore');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
const getAllUsers = (req, res) => {
  try {
    const users = dataStore.users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation,
      zone: user.zone,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      photo: user.photo,
      createdAt: user.createdAt || new Date().toISOString()
    }));
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Create new user (admin only)
const createUser = (req, res) => {
  try {
    const { email, password, name, role, designation, zone, schoolId } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Email, password, name, and role are required' });
    }

    // Check if email already exists
    if (dataStore.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = {
      id: `${role}_${uuidv4().split('-')[0]}`,
      email,
      password: bcrypt.hashSync(password, 10),
      name,
      role,
      designation: designation || '',
      zone: zone || '',
      schoolId: schoolId || null,
      schoolName: schoolId ? dataStore.getSchoolById(schoolId)?.name : null,
      photo: '/uploads/users/default.jpg',
      createdAt: new Date().toISOString()
    };

    dataStore.users.push(newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        designation: newUser.designation,
        zone: newUser.zone,
        schoolId: newUser.schoolId,
        schoolName: newUser.schoolName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// Update user (admin only)
const updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, designation, zone, schoolId, password } = req.body;

    const user = dataStore.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) user.email = email;
    if (name) user.name = name;
    if (role) user.role = role;
    if (designation !== undefined) user.designation = designation;
    if (zone !== undefined) user.zone = zone;
    if (schoolId !== undefined) {
      user.schoolId = schoolId;
      user.schoolName = schoolId ? dataStore.getSchoolById(schoolId)?.name : null;
    }
    if (password) user.password = bcrypt.hashSync(password, 10);

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
        zone: user.zone,
        schoolId: user.schoolId,
        schoolName: user.schoolName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// Delete user (admin only)
const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const index = dataStore.users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    const remainingAdmins = dataStore.users.filter(u => u.role === 'kendrapramukh' && u.id !== id);
    if (remainingAdmins.length === 0 && dataStore.users[index].role === 'kendrapramukh') {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }

    dataStore.users.splice(index, 1);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Get all schools (admin only)
const getAllSchools = (req, res) => {
  try {
    res.json({ schools: dataStore.schools, count: dataStore.schools.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schools', error: error.message });
  }
};

// Create new school (admin only)
const createSchool = (req, res) => {
  try {
    const { name, udise, address, contact, email, headmasterName, headmasterContact, established, type, facilities } = req.body;

    if (!name || !udise) {
      return res.status(400).json({ message: 'School name and UDISE code are required' });
    }

    // Check if UDISE already exists
    if (dataStore.schools.find(s => s.udise === udise)) {
      return res.status(400).json({ message: 'UDISE code already exists' });
    }

    const newSchool = {
      id: `school_${uuidv4().split('-')[0]}`,
      name,
      udise,
      address: address || '',
      contact: contact || '',
      email: email || '',
      headmasterId: null,
      headmasterName: headmasterName || '',
      headmasterContact: headmasterContact || '',
      established: established || new Date().getFullYear(),
      type: type || 'Primary',
      staff: { teachers: 0, admin: 0, support: 0 },
      facilities: facilities || [],
      photo: '/uploads/schools/default.jpg'
    };

    dataStore.schools.push(newSchool);

    res.status(201).json({
      message: 'School created successfully',
      school: newSchool
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create school', error: error.message });
  }
};

// Update school (admin only)
const updateSchool = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const school = dataStore.schools.find(s => s.id === id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const allowedUpdates = ['name', 'udise', 'address', 'contact', 'email', 'headmasterName', 'headmasterContact', 'established', 'type', 'facilities', 'staff'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        school[field] = updates[field];
      }
    });

    res.json({
      message: 'School updated successfully',
      school
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update school', error: error.message });
  }
};

// Delete school (admin only)
const deleteSchool = (req, res) => {
  try {
    const { id } = req.params;
    const index = dataStore.schools.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'School not found' });
    }

    dataStore.schools.splice(index, 1);
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete school', error: error.message });
  }
};

// Get dashboard stats (admin only)
const getStats = (req, res) => {
  try {
    const stats = {
      totalSchools: dataStore.schools.length,
      totalUsers: dataStore.users.length,
      totalHeadmasters: dataStore.users.filter(u => u.role === 'headmaster').length,
      totalAdmins: dataStore.users.filter(u => u.role === 'kendrapramukh').length,
      totalEvents: dataStore.events.length,
      totalGRs: dataStore.grs.length,
      totalMeetings: dataStore.meetings.length,
      recentActivity: [
        ...dataStore.grs.slice(0, 3).map(gr => ({ type: 'gr', title: gr.title, date: gr.uploadedAt })),
        ...dataStore.events.slice(0, 3).map(event => ({ type: 'event', title: event.name, date: event.startDate })),
        ...dataStore.meetings.slice(0, 3).map(meeting => ({ type: 'meeting', title: meeting.title, date: meeting.date }))
      ]
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getStats
};
