const dataStore = require('../models/dataStore');
const { v4: uuidv4 } = require('uuid');
const notificationController = require('./notificationController');

// Get all GRs
const getAllGRs = (req, res) => {
  try {
    const { status, search } = req.query;
    let grs = [...dataStore.grs];

    // Filter by status
    if (status) {
      grs = grs.filter(gr => gr.status === status);
    }

    // Search by title or circular number
    if (search) {
      const searchLower = search.toLowerCase();
      grs = grs.filter(gr => 
        gr.title.toLowerCase().includes(searchLower) ||
        gr.circularNumber.toLowerCase().includes(searchLower)
      );
    }

    // For headmasters, add seen status
    if (req.user.role === 'headmaster') {
      grs = grs.map(gr => ({
        ...gr,
        myStatus: gr.viewStatus[req.user.schoolId] || { seen: false, seenAt: null }
      }));
    }

    // Sort by upload date (newest first)
    grs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ grs, count: grs.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch GRs', error: error.message });
  }
};

// Get single GR by ID
const getGRById = (req, res) => {
  try {
    const { id } = req.params;
    const gr = dataStore.getGRById(id);

    if (!gr) {
      return res.status(404).json({ message: 'GR not found' });
    }

    let response = { ...gr };

    // For headmasters, include personal view status
    if (req.user.role === 'headmaster') {
      response.myStatus = gr.viewStatus[req.user.schoolId] || { seen: false, seenAt: null };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch GR', error: error.message });
  }
};

// Create new GR (Admin only)
const createGR = (req, res) => {
  try {
    const { title, circularNumber, description } = req.body;
    
    if (!title || !circularNumber) {
      return res.status(400).json({ message: 'Title and circular number are required' });
    }

    const newGR = {
      id: `gr_${uuidv4().split('-')[0]}`,
      title,
      circularNumber,
      description: description || '',
      fileUrl: req.file ? `/uploads/gr/${req.file.filename}` : null,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      status: 'active',
      viewStatus: dataStore.schools.reduce((acc, school) => {
        acc[school.id] = { seen: false, seenAt: null };
        return acc;
      }, {})
    };

    dataStore.grs.push(newGR);

    // Notify all headmasters about new GR
    notificationController.notifyAllHeadmasters(
      'gr',
      'New GR Uploaded',
      `${title} (${circularNumber}) has been uploaded. Please review.`,
      newGR.id,
      'gr'
    );

    res.status(201).json({
      message: 'GR created successfully',
      gr: newGR
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create GR', error: error.message });
  }
};

// Mark GR as seen (Headmaster only)
const markAsSeen = (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'headmaster') {
      return res.status(403).json({ message: 'Headmaster access required' });
    }

    const gr = dataStore.getGRById(id);
    if (!gr) {
      return res.status(404).json({ message: 'GR not found' });
    }

    // Mark as seen for this school
    if (!gr.viewStatus[req.user.schoolId]) {
      gr.viewStatus[req.user.schoolId] = {};
    }
    gr.viewStatus[req.user.schoolId] = { seen: true, seenAt: new Date().toISOString() };

    // Notify admin about GR being seen
    const admins = dataStore.users.filter(u => u.role === 'kendrapramukh');
    admins.forEach(admin => {
      dataStore.addNotification({
        userId: admin.id,
        type: 'gr_seen',
        title: 'GR Viewed',
        message: `${req.user.schoolName} has viewed ${gr.title}`,
        relatedId: gr.id,
        relatedType: 'gr'
      });
    });

    res.json({ message: 'GR marked as seen' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark GR as seen', error: error.message });
  }
};

// Get GR statistics (Admin only)
const getGRStats = (req, res) => {
  try {
    const stats = {
      total: dataStore.grs.length,
      active: dataStore.grs.filter(gr => gr.status === 'active').length,
      archived: dataStore.grs.filter(gr => gr.status === 'archived').length,
      viewStats: {}
    };

    // Calculate view statistics per school
    dataStore.schools.forEach(school => {
      const seen = dataStore.grs.filter(gr => gr.viewStatus[school.id]?.seen).length;
      stats.viewStats[school.id] = {
        schoolName: school.name,
        total: dataStore.grs.length,
        seen,
        pending: dataStore.grs.length - seen
      };
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch GR stats', error: error.message });
  }
};

// Delete GR (Admin only)
const deleteGR = (req, res) => {
  try {
    const { id } = req.params;
    const index = dataStore.grs.findIndex(gr => gr.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'GR not found' });
    }

    dataStore.grs.splice(index, 1);
    res.json({ message: 'GR deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete GR', error: error.message });
  }
};

module.exports = {
  getAllGRs,
  getGRById,
  createGR,
  markAsSeen,
  getGRStats,
  deleteGR
};
