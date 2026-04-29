const dataStore = require('../models/dataStore');

// Get attendance for a specific school
const getSchoolAttendance = (req, res) => {
  try {
    const { schoolId } = req.params;
    const { period = 'daily' } = req.query; // daily, weekly, monthly

    // Check authorization
    if (req.user.role === 'headmaster' && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: 'You can only access your own school data' });
    }

    const school = dataStore.getSchoolById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const attendance = dataStore.attendanceData[schoolId];
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance data not found' });
    }

    let data;
    let summary = {};

    switch (period) {
      case 'daily':
        data = attendance.daily;
        // Calculate summary
        const latest = data[data.length - 1];
        const previous = data[data.length - 2];
        summary = {
          current: {
            date: latest.date,
            teachers: latest.teachers,
            students: latest.students,
            staff: latest.staff,
            totalPresent: latest.totalPresent,
            totalCount: latest.totalCount
          },
          previous: {
            date: previous?.date,
            teachers: previous?.teachers,
            students: previous?.students
          },
          change: {
            teachers: latest.teachers - (previous?.teachers || 0),
            students: latest.students - (previous?.students || 0)
          },
          average: {
            teachers: Math.round(data.reduce((sum, d) => sum + d.teachers, 0) / data.length),
            students: Math.round(data.reduce((sum, d) => sum + d.students, 0) / data.length),
            staff: Math.round(data.reduce((sum, d) => sum + d.staff, 0) / data.length)
          }
        };
        break;
      
      case 'weekly':
        data = attendance.weekly;
        summary = {
          average: {
            teachers: Math.round(data.reduce((sum, d) => sum + d.teachers, 0) / data.length),
            students: Math.round(data.reduce((sum, d) => sum + d.students, 0) / data.length),
            staff: Math.round(data.reduce((sum, d) => sum + d.staff, 0) / data.length)
          }
        };
        break;
      
      case 'monthly':
        data = attendance.monthly;
        summary = {
          average: {
            teachers: Math.round(data.reduce((sum, d) => sum + d.teachers, 0) / data.length),
            students: Math.round(data.reduce((sum, d) => sum + d.students, 0) / data.length),
            staff: Math.round(data.reduce((sum, d) => sum + d.staff, 0) / data.length)
          }
        };
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid period. Use daily, weekly, or monthly' });
    }

    res.json({
      schoolId,
      schoolName: school.name,
      period,
      data,
      summary
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// Get all schools attendance summary (Admin only)
const getAllAttendanceSummary = (req, res) => {
  try {
    const aggregatePeriod = (periodKey) => {
      const firstSchoolId = dataStore.schools[0]?.id;
      const baseEntries = dataStore.attendanceData[firstSchoolId]?.[periodKey] || [];

      return baseEntries.map((entry, index) => {
        const totals = dataStore.schools.reduce((acc, school) => {
          const periodEntry = dataStore.attendanceData[school.id]?.[periodKey]?.[index];
          acc.teachers += periodEntry?.teachers || 0;
          acc.students += periodEntry?.students || 0;
          acc.staff += periodEntry?.staff || 0;
          return acc;
        }, { teachers: 0, students: 0, staff: 0 });

        return {
          ...entry,
          teachers: Math.round(totals.teachers / dataStore.schools.length),
          students: Math.round(totals.students / dataStore.schools.length),
          staff: Math.round(totals.staff / dataStore.schools.length)
        };
      });
    };

    const summary = dataStore.schools.map(school => {
      const attendance = dataStore.attendanceData[school.id];
      const latest = attendance?.daily[attendance.daily.length - 1];
      
      return {
        schoolId: school.id,
        schoolName: school.name,
        attendance: latest ? {
          date: latest.date,
          teachers: latest.teachers,
          students: latest.students,
          staff: latest.staff
        } : null
      };
    });

    // Calculate district average
    const districtAverage = {
      teachers: Math.round(summary.reduce((sum, s) => sum + (s.attendance?.teachers || 0), 0) / summary.length),
      students: Math.round(summary.reduce((sum, s) => sum + (s.attendance?.students || 0), 0) / summary.length),
      staff: Math.round(summary.reduce((sum, s) => sum + (s.attendance?.staff || 0), 0) / summary.length)
    };

    res.json({
      summary,
      districtAverage,
      totalSchools: summary.length,
      daily: aggregatePeriod('daily').slice(-7),
      weekly: aggregatePeriod('weekly'),
      monthly: aggregatePeriod('monthly')
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance summary', error: error.message });
  }
};

// Get headmaster's school attendance
const getMyAttendance = (req, res) => {
  try {
    if (req.user.role !== 'headmaster' || !req.user.schoolId) {
      return res.status(403).json({ message: 'Headmaster access required' });
    }

    const { period = 'daily' } = req.query;
    
    // Reuse the existing logic
    req.params.schoolId = req.user.schoolId;
    return getSchoolAttendance(req, res);
    
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// Update attendance (simulate real-time update)
const updateAttendance = (req, res) => {
  try {
    const { schoolId } = req.params;
    const { teachers, students, staff } = req.body;

    // Check authorization
    if (req.user.role === 'headmaster' && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: 'You can only update your own school data' });
    }

    const attendance = dataStore.attendanceData[schoolId];
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance data not found' });
    }

    // Update today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = attendance.daily.find(d => d.date === today);

    if (todayEntry) {
      if (teachers !== undefined) todayEntry.teachers = teachers;
      if (students !== undefined) todayEntry.students = students;
      if (staff !== undefined) todayEntry.staff = staff;
    } else {
      // Add new entry
      attendance.daily.push({
        date: today,
        teachers: teachers || 0,
        students: students || 0,
        staff: staff || 0,
        totalPresent: 0,
        totalCount: 0
      });
    }

    res.json({ message: 'Attendance updated successfully', date: today });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
};

// Get attendance trends (for charts)
const getAttendanceTrends = (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const trends = dataStore.schools.map(school => {
      const attendance = dataStore.attendanceData[school.id];
      const recentData = attendance?.daily.slice(-parseInt(days)) || [];
      
      return {
        schoolId: school.id,
        schoolName: school.name,
        data: recentData.map(d => ({
          date: d.date,
          teachers: d.teachers,
          students: d.students,
          staff: d.staff
        }))
      };
    });

    res.json({ trends, days: parseInt(days) });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance trends', error: error.message });
  }
};

// Mark daily attendance (Headmaster only)
const markDailyAttendance = (req, res) => {
  try {
    if (req.user.role !== 'headmaster' || !req.user.schoolId) {
      return res.status(403).json({ message: 'Headmaster access required' });
    }

    const { 
      date, 
      teachersPresent, 
      teachersTotal, 
      studentsPresent, 
      studentsTotal, 
      staffPresent, 
      staffTotal 
    } = req.body;

    // Convert to numbers and validate
    const tPresent = parseInt(teachersPresent);
    const tTotal = parseInt(teachersTotal);
    const sPresent = parseInt(studentsPresent);
    const sTotal = parseInt(studentsTotal);
    const stfPresent = parseInt(staffPresent);
    const stfTotal = parseInt(staffTotal);

    // Validate required fields
    if (!date || isNaN(tPresent) || isNaN(tTotal) || isNaN(sPresent) || 
        isNaN(sTotal) || isNaN(stfPresent) || isNaN(stfTotal)) {
      return res.status(400).json({ message: 'All attendance fields are required and must be valid numbers' });
    }

    // Validate that present <= total
    if (tPresent > tTotal || sPresent > sTotal || stfPresent > stfTotal) {
      return res.status(400).json({ message: 'Present count cannot exceed total count' });
    }

    const schoolId = req.user.schoolId;
    const attendance = dataStore.attendanceData[schoolId];

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance data not found for school' });
    }

    // Calculate percentages
    const teachers = Math.round((tPresent / tTotal) * 100);
    const students = Math.round((sPresent / sTotal) * 100);
    const staff = Math.round((stfPresent / stfTotal) * 100);
    const totalPresent = tPresent + sPresent + stfPresent;
    const totalCount = tTotal + sTotal + stfTotal;

    // Check if entry for this date already exists
    const existingEntryIndex = attendance.daily.findIndex(d => d.date === date);

    const newEntry = {
      date,
      teachers,
      students,
      staff,
      totalPresent,
      totalCount
    };

    if (existingEntryIndex >= 0) {
      // Update existing entry
      attendance.daily[existingEntryIndex] = newEntry;
    } else {
      // Add new entry
      attendance.daily.push(newEntry);
    }

    // Get school name for response
    const school = dataStore.getSchoolById(schoolId);
    const schoolName = school ? school.name : 'your school';

    res.json({ 
      message: 'Attendance marked successfully', 
      schoolName: schoolName,
      data: newEntry 
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
};

module.exports = {
  getSchoolAttendance,
  getAllAttendanceSummary,
  getMyAttendance,
  updateAttendance,
  getAttendanceTrends,
  markDailyAttendance
};
