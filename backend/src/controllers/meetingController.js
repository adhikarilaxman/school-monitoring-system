const dataStore = require('../models/dataStore');
const { v4: uuidv4 } = require('uuid');
const notificationController = require('./notificationController');

// Get all meetings
const getAllMeetings = (req, res) => {
  try {
    const { status, type } = req.query;
    let meetings = [...dataStore.meetings];

    // Filter by status
    if (status) {
      meetings = meetings.filter(m => m.status === status);
    }

    // Filter by type
    if (type) {
      meetings = meetings.filter(m => m.type === type);
    }

    // For headmasters - show their response status
    if (req.user.role === 'headmaster') {
      meetings = meetings.map(m => ({
        ...m,
        myResponse: m.schoolResponses?.[req.user.schoolId] || { status: 'pending', respondedAt: null }
      }));
    }

    // Sort by date (upcoming first)
    meetings.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ meetings, count: meetings.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings', error: error.message });
  }
};

// Get single meeting by ID
const getMeetingById = (req, res) => {
  try {
    const { id } = req.params;
    const meeting = dataStore.getMeetingById(id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    let response = { ...meeting };

    // For headmasters, include their response
    if (req.user.role === 'headmaster') {
      response.myResponse = meeting.schoolResponses?.[req.user.schoolId] || { status: 'pending', respondedAt: null };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meeting', error: error.message });
  }
};

// Create new meeting (Admin only)
const createMeeting = (req, res) => {
  try {
    const { title, type, date, time, venue, agenda, link, schoolIds } = req.body;
    
    if (!title || !date || !time) {
      return res.status(400).json({ message: 'Title, date, and time are required' });
    }

    const targetSchools = schoolIds === 'all'
      ? dataStore.schools.map(s => s.id)
      : JSON.parse(schoolIds || '[]');

    const newMeeting = {
      id: `meeting_${uuidv4().split('-')[0]}`,
      title,
      type: type || 'offline',
      date,
      time,
      venue: venue || '',
      link: link || '',
      agenda: agenda || '',
      organizedBy: req.user.id,
      status: 'scheduled',
      schoolResponses: targetSchools.reduce((acc, schoolId) => {
        acc[schoolId] = { status: 'pending', respondedAt: null };
        return acc;
      }, {})
    };

    dataStore.meetings.push(newMeeting);

    // Notify all headmasters about new meeting
    if (schoolIds === 'all') {
      notificationController.notifyAllHeadmasters(
        'meeting',
        'New Meeting Scheduled',
        `${title} on ${new Date(date).toLocaleDateString()} at ${time}`,
        newMeeting.id,
        'meeting'
      );
    } else {
      targetSchools.forEach(schoolId => {
        const school = dataStore.getSchoolById(schoolId);
        if (school) {
          dataStore.addNotification({
            userId: school.headmasterId,
            type: 'meeting',
            title: 'New Meeting Scheduled',
            message: `${title} on ${new Date(date).toLocaleDateString()} at ${time}`,
            relatedId: newMeeting.id,
            relatedType: 'meeting'
          });
        }
      });
    }

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: newMeeting
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create meeting', error: error.message });
  }
};

// Respond to meeting invitation (Headmaster only)
const respondToMeeting = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted', 'declined', 'tentative'

    if (req.user.role !== 'headmaster') {
      return res.status(403).json({ message: 'Headmaster access required' });
    }

    if (!['accepted', 'declined', 'tentative'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use accepted, declined, or tentative' });
    }

    const meeting = dataStore.getMeetingById(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Update response
    if (!meeting.schoolResponses) {
      meeting.schoolResponses = {};
    }

    meeting.schoolResponses[req.user.schoolId] = {
      status,
      respondedAt: new Date().toISOString()
    };

    // Notify admin
    dataStore.addNotification({
      userId: 'admin_1',
      type: 'meeting_response',
      title: 'Meeting Response Received',
      message: `${req.user.schoolName} ${status} the meeting: ${meeting.title}`,
      relatedId: meeting.id,
      relatedType: 'meeting'
    });

    res.json({
      message: `Meeting ${status} successfully`,
      response: meeting.schoolResponses[req.user.schoolId]
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to respond to meeting', error: error.message });
  }
};

// Get meeting statistics (Admin only)
const getMeetingStats = (req, res) => {
  try {
    const stats = {
      total: dataStore.meetings.length,
      scheduled: dataStore.meetings.filter(m => m.status === 'scheduled').length,
      completed: dataStore.meetings.filter(m => m.status === 'completed').length,
      cancelled: dataStore.meetings.filter(m => m.status === 'cancelled').length,
      byType: {}
    };

    // Count by type
    dataStore.meetings.forEach(meeting => {
      stats.byType[meeting.type] = (stats.byType[meeting.type] || 0) + 1;
    });

    // Response statistics per meeting
    stats.responses = dataStore.meetings.map(meeting => {
      const responses = Object.values(meeting.schoolResponses || {});
      return {
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        totalSchools: responses.length,
        accepted: responses.filter(r => r.status === 'accepted').length,
        declined: responses.filter(r => r.status === 'declined').length,
        tentative: responses.filter(r => r.status === 'tentative').length,
        pending: responses.filter(r => r.status === 'pending').length
      };
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meeting stats', error: error.message });
  }
};

// Update meeting (Admin only)
const updateMeeting = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const meeting = dataStore.meetings.find(m => m.id === id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const allowedUpdates = ['title', 'date', 'time', 'venue', 'link', 'agenda', 'status'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        meeting[field] = updates[field];
      }
    });

    // If status changed to cancelled, notify all schools
    if (updates.status === 'cancelled') {
      Object.keys(meeting.schoolResponses || {}).forEach(schoolId => {
        const school = dataStore.getSchoolById(schoolId);
        if (school) {
          dataStore.addNotification({
            userId: school.headmasterId,
            type: 'meeting_cancelled',
            title: 'Meeting Cancelled',
            message: `${meeting.title} has been cancelled`,
            relatedId: meeting.id,
            relatedType: 'meeting'
          });
        }
      });
    }

    res.json({ message: 'Meeting updated successfully', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update meeting', error: error.message });
  }
};

// Delete meeting (Admin only)
const deleteMeeting = (req, res) => {
  try {
    const { id } = req.params;
    const index = dataStore.meetings.findIndex(m => m.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    dataStore.meetings.splice(index, 1);
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete meeting', error: error.message });
  }
};

module.exports = {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  respondToMeeting,
  getMeetingStats,
  updateMeeting,
  deleteMeeting
};
