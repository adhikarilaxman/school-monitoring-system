const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../models/dataStore');
const { JWT_SECRET } = require('../middleware/auth');

// Login controller
const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = dataStore.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation,
      zone: user.zone,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      photo: user.photo
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user profile
const getProfile = (req, res) => {
  try {
    const user = dataStore.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation,
      zone: user.zone,
      photo: user.photo
    };

    // Add school details for headmasters
    if (user.role === 'headmaster' && user.schoolId) {
      const school = dataStore.getSchoolById(user.schoolId);
      profile.school = {
        id: school.id,
        name: school.name,
        udise: school.udise,
        address: school.address,
        contact: school.contact
      };
    }

    res.json(profile);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

// Change password
const changePassword = (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = dataStore.users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

// Update profile
const updateProfile = (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const user = dataStore.users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // Prepare response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation,
      zone: user.zone,
      phone: user.phone,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      photo: user.photo
    };

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
  updateProfile
};
