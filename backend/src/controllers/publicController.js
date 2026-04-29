const dataStore = require('../models/dataStore');

// Get all schools for public view
const getPublicSchools = (req, res) => {
  try {
    const schools = dataStore.schools.map(school => ({
      id: school.id,
      name: school.name,
      udise: school.udise,
      address: school.address,
      contact: school.contact,
      email: school.email,
      established: school.established,
      type: school.type,
      headmasterName: school.headmasterName,
      headmasterContact: school.headmasterContact,
      headmasterPhoto: school.headmasterPhoto,
      staff: school.staff,
      facilities: school.facilities,
      photo: school.photo,
      staffPhotos: dataStore.staffPhotos[school.id] || []
    }));

    res.json({ schools, count: schools.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schools', error: error.message });
  }
};

// Get single school public details
const getPublicSchoolById = (req, res) => {
  try {
    const { id } = req.params;
    const school = dataStore.getSchoolById(id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Add additional public info
    const publicInfo = {
      ...school,
      headmasterPhoto: school.headmasterPhoto,
      staffPhotos: dataStore.staffPhotos[school.id] || [],
      attendance: dataStore.attendanceData[school.id]?.monthly || []
    };

    res.json(publicInfo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch school', error: error.message });
  }
};

// Get programs gallery (completed events)
const getProgramsGallery = (req, res) => {
  try {
    // Get events with submissions
    const programs = dataStore.events
      .filter(event => Object.keys(event.submissions || {}).length > 0)
      .map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        date: event.startDate,
        venue: event.venue,
        photo: event.photo,
        coverPhoto: event.coverPhoto,
        submissions: Object.entries(event.submissions || {}).map(([schoolId, submission]) => {
          const school = dataStore.getSchoolById(schoolId);
          return {
            schoolId,
            schoolName: school?.name || 'Unknown School',
            photos: submission.photos || [],
            report: submission.report,
            completionDate: submission.completionDate
          };
        })
      }));

    res.json({ programs, count: programs.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch programs', error: error.message });
  }
};

// Get toppers list
const getToppers = (req, res) => {
  try {
    const toppers = dataStore.toppers.map(topper => {
      const school = dataStore.getSchoolById(topper.schoolId);
      return {
        ...topper,
        schoolName: school?.name || 'Unknown School'
      };
    });

    // Sort by percentage (highest first)
    toppers.sort((a, b) => b.percentage - a.percentage);

    res.json({ toppers, count: toppers.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch toppers', error: error.message });
  }
  }

// Get attendance summary for public view
const getPublicAttendance = (req, res) => {
  try {
    const attendanceSummary = dataStore.schools.map(school => {
      const attendance = dataStore.attendanceData[school.id];
      const latest = attendance?.daily[attendance.daily.length - 1];
      const monthlyAvg = attendance?.monthly.reduce((sum, m) => sum + m.students, 0) / (attendance?.monthly.length || 1);

      return {
        schoolId: school.id,
        schoolName: school.name,
        currentAttendance: latest?.students || 0,
        monthlyAverage: Math.round(monthlyAvg),
        monthlyData: attendance?.monthly || []
      };
    });

    // Calculate district average
    const districtAverage = Math.round(
      attendanceSummary.reduce((sum, s) => sum + s.currentAttendance, 0) / attendanceSummary.length
    );

    res.json({
      districtAverage,
      schools: attendanceSummary,
      totalSchools: attendanceSummary.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// Get dashboard stats for public page
const getPublicStats = (req, res) => {
  try {
    const stats = {
      totalSchools: dataStore.schools.length,
      totalStudents: dataStore.schools.reduce((sum, s) => sum + 200, 0), // Estimated
      totalStaff: dataStore.schools.reduce((sum, s) => sum + s.staff.teachers + s.staff.admin + s.staff.support, 0),
      districtAttendance: Math.round(
        dataStore.schools.reduce((sum, s) => {
          const attendance = dataStore.attendanceData[s.id];
          return sum + (attendance?.daily[attendance.daily.length - 1]?.students || 0);
        }, 0) / dataStore.schools.length
      ),
      activePrograms: dataStore.events.filter(e => e.status === 'ongoing' || e.status === 'upcoming').length,
      completedPrograms: dataStore.events.filter(e => Object.keys(e.submissions || {}).length > 0).length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

// Search functionality
const searchPublic = (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchLower = query.toLowerCase();
    
    // Search schools
    const schools = dataStore.schools.filter(s =>
      s.name.toLowerCase().includes(searchLower) ||
      s.headmasterName.toLowerCase().includes(searchLower) ||
      s.address.toLowerCase().includes(searchLower)
    );

    // Search events/programs
    const programs = dataStore.events.filter(e =>
      e.name.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower)
    );

    res.json({
      schools: schools.map(s => ({ id: s.id, name: s.name, type: 'school' })),
      programs: programs.map(p => ({ id: p.id, name: p.name, type: 'program' })),
      totalResults: schools.length + programs.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

module.exports = {
  getPublicSchools,
  getPublicSchoolById,
  getProgramsGallery,
  getToppers,
  getPublicAttendance,
  getPublicStats,
  searchPublic
};
