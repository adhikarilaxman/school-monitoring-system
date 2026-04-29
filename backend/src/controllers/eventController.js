const dataStore = require('../models/dataStore');
const { v4: uuidv4 } = require('uuid');
const notificationController = require('./notificationController');

// Get all events
const getAllEvents = (req, res) => {
  try {
    const { status, type, mySchool } = req.query;
    let events = [...dataStore.events];

    // Filter by status
    if (status) {
      events = events.filter(e => e.status === status);
    }

    // Filter by type
    if (type) {
      events = events.filter(e => e.type === type);
    }

    // For headmasters - only show events for their school
    if (req.user.role === 'headmaster' && mySchool === 'true') {
      events = events.filter(e => e.schools.includes(req.user.schoolId));
      
      // Add submission status for each event
      events = events.map(e => ({
        ...e,
        mySubmission: e.submissions?.[req.user.schoolId] || null
      }));
    }

    // Sort by start date (newest first)
    events.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    res.json({ events, count: events.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Get single event by ID
const getEventById = (req, res) => {
  try {
    const { id } = req.params;
    const event = dataStore.getEventById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization for headmasters
    if (req.user.role === 'headmaster' && !event.schools.includes(req.user.schoolId)) {
      return res.status(403).json({ message: 'You are not authorized to view this event' });
    }

    let response = { ...event };

    // For headmasters, include their submission
    if (req.user.role === 'headmaster') {
      response.mySubmission = event.submissions?.[req.user.schoolId] || null;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

// Create new event (Admin only)
const createEvent = (req, res) => {
  try {
    const { name, description, type, startDate, endDate, venue, schoolIds } = req.body;
    
    if (!name || !startDate) {
      return res.status(400).json({ message: 'Event name and start date are required' });
    }

    const targetSchools = schoolIds === 'all' 
      ? dataStore.schools.map(s => s.id)
      : JSON.parse(schoolIds || '[]');

    const newEvent = {
      id: `event_${uuidv4().split('-')[0]}`,
      name,
      description: description || '',
      type: type || 'general',
      startDate,
      endDate: endDate || startDate,
      venue: venue || '',
      organizedBy: req.user.id,
      status: 'upcoming',
      photo: req.files?.[0] ? `/uploads/events/${req.files[0].filename}` : null,
      coverPhoto: req.files?.[1] ? `/uploads/events/${req.files[1].filename}` : req.files?.[0] ? `/uploads/events/${req.files[0].filename}` : null,
      schools: targetSchools,
      submissions: {}
    };

    dataStore.events.push(newEvent);

    // Notify all headmasters about new event
    if (schoolIds === 'all') {
      notificationController.notifyAllHeadmasters(
        'event',
        'New Event Created',
        `${name} - ${description?.substring(0, 50) || 'No description'}...`,
        newEvent.id,
        'event'
      );
    } else {
      targetSchools.forEach(schoolId => {
        const school = dataStore.getSchoolById(schoolId);
        if (school) {
          dataStore.addNotification({
            userId: school.headmasterId,
            type: 'event',
            title: 'New Event Created',
            message: `${name} - ${description?.substring(0, 50)}...`,
            relatedId: newEvent.id,
            relatedType: 'event'
          });
        }
      });
    }

    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

// Submit event completion (Headmaster only)
const submitEvent = (req, res) => {
  try {
    const { id } = req.params;
    const { report, completionDate } = req.body;

    if (req.user.role !== 'headmaster') {
      return res.status(403).json({ message: 'Headmaster access required' });
    }

    const event = dataStore.getEventById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if school is part of this event
    if (!event.schools.includes(req.user.schoolId)) {
      return res.status(403).json({ message: 'Your school is not part of this event' });
    }

    // Process uploaded photos
    const photos = req.files?.map(file => `/uploads/events/submissions/${file.filename}`) || [];

    // Add or update submission
    if (!event.submissions) {
      event.submissions = {};
    }

    event.submissions[req.user.schoolId] = {
      submitted: true,
      submittedAt: new Date().toISOString(),
      photos,
      report: report || '',
      completionDate: completionDate || new Date().toISOString()
    };

    // Notify admin about event submission
    const admins = dataStore.users.filter(u => u.role === 'kendrapramukh');
    admins.forEach(admin => {
      dataStore.addNotification({
        userId: admin.id,
        type: 'event_submission',
        title: 'Event Submission Received',
        message: `${req.user.schoolName} submitted report for ${event.name}`,
        relatedId: event.id,
        relatedType: 'event'
      });
    });

    res.json({
      message: 'Event submission successful',
      submission: event.submissions[req.user.schoolId]
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit event', error: error.message });
  }
};

// Get event statistics (Admin only)
const getEventStats = (req, res) => {
  try {
    const stats = {
      total: dataStore.events.length,
      upcoming: dataStore.events.filter(e => e.status === 'upcoming').length,
      ongoing: dataStore.events.filter(e => e.status === 'ongoing').length,
      completed: dataStore.events.filter(e => e.status === 'completed').length,
      byType: {}
    };

    // Count by type
    dataStore.events.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    });

    // Submission statistics per event
    stats.submissions = dataStore.events.map(event => ({
      eventId: event.id,
      eventName: event.name,
      totalSchools: event.schools.length,
      submissionsReceived: Object.keys(event.submissions || {}).length,
      pending: event.schools.length - Object.keys(event.submissions || {}).length
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event stats', error: error.message });
  }
};

// Update event (Admin only)
const updateEvent = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = dataStore.events.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const allowedUpdates = ['name', 'description', 'status', 'startDate', 'endDate', 'venue'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        event[field] = updates[field];
      }
    });

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

// Delete event (Admin only)
const deleteEvent = (req, res) => {
  try {
    const { id } = req.params;
    const index = dataStore.events.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }

    dataStore.events.splice(index, 1);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  submitEvent,
  getEventStats,
  updateEvent,
  deleteEvent
};
