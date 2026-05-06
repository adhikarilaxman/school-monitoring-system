// In-memory Data Store for Scholastic Archive System
// Structured for easy migration to database later

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Helper to hash passwords
const hashPassword = (password) => bcrypt.hashSync(password, 10);

// 12 Schools Data - Real Chhatrapati Sambhajinagar Schools
const schools = [
  {
    id: 'school_1',
    name: 'St. Xavier\'s High School, Chhatrapati Sambhajinagar',
    udise: '2712300401',
    address: 'Jalna Road, Chhatrapati Sambhajinagar',
    contact: '0240-2332456',
    email: 'stxavier.csb@eduauthority.gov.in',
    headmasterId: 'hm_1',
    headmasterName: 'Rajesh Deshmukh',
    headmasterContact: '9876543210',
    established: 1985,
    type: 'Secondary',
    staff: { teachers: 12, admin: 3, support: 5 },
    facilities: ['Library', 'Computer Lab', 'Playground', 'Drinking Water', 'Sanitation'],
    photo: '/uploads/schools/school_1.jpg'
  },
  {
    id: 'school_2',
    name: 'Carmel Convent High School',
    udise: '2712300402',
    address: 'Nirala Bazar, Chhatrapati Sambhajinagar',
    contact: '0240-2337890',
    email: 'carmel.csb@eduauthority.gov.in',
    headmasterId: 'hm_2',
    headmasterName: 'Sunita Patil',
    headmasterContact: '9876543211',
    established: 1990,
    type: 'Secondary',
    staff: { teachers: 18, admin: 4, support: 6 },
    facilities: ['Library', 'Science Lab', 'Computer Lab', 'Sports Ground', 'Auditorium'],
    photo: '/uploads/schools/school_2.jpg'
  },
  {
    id: 'school_3',
    name: 'Deogiri College School',
    udise: '2712300403',
    address: 'Station Road, Chhatrapati Sambhajinagar',
    contact: '0240-2345678',
    email: 'deogiri.csb@eduauthority.gov.in',
    headmasterId: 'hm_3',
    headmasterName: 'Amit Kulkarni',
    headmasterContact: '9876543212',
    established: 1988,
    type: 'Higher Secondary',
    staff: { teachers: 15, admin: 3, support: 4 },
    facilities: ['Library', 'Computer Lab', 'Sports Facilities', 'Canteen'],
    photo: '/uploads/schools/school_3.jpg'
  },
  {
    id: 'school_4',
    name: 'MIT Vishwashanti Gurukul School',
    udise: '2712300404',
    address: 'MIT Campus, Rajgurunagar, Chhatrapati Sambhajinagar',
    contact: '0240-2567890',
    email: 'mit.csb@eduauthority.gov.in',
    headmasterId: 'hm_4',
    headmasterName: 'Maria Fernandes',
    headmasterContact: '9876543213',
    established: 1975,
    type: 'CBSE',
    staff: { teachers: 20, admin: 5, support: 8 },
    facilities: ['Library', 'Science Labs', 'Computer Lab', 'Auditorium', 'Sports Complex'],
    photo: '/uploads/schools/school_4.jpg'
  },
  {
    id: 'school_5',
    name: 'Zilla Parishad Primary School, CIDCO',
    udise: '2712300405',
    address: 'CIDCO N-1, Chhatrapati Sambhajinagar',
    contact: '0240-2341234',
    email: 'zpcidco.csb@eduauthority.gov.in',
    headmasterId: 'hm_5',
    headmasterName: 'Prakash Pawar',
    headmasterContact: '9876543214',
    established: 1995,
    type: 'Primary',
    staff: { teachers: 10, admin: 2, support: 3 },
    facilities: ['Library', 'Playground', 'Smart Classroom'],
    photo: '/uploads/schools/school_5.jpg'
  },
  {
    id: 'school_6',
    name: 'Shivaji High School',
    udise: '2712300406',
    address: 'Khadki Bazar, Chhatrapati Sambhajinagar',
    contact: '0240-2334567',
    email: 'shivaji.csb@eduauthority.gov.in',
    headmasterId: 'hm_6',
    headmasterName: 'Lata Sharma',
    headmasterContact: '9876543215',
    established: 1982,
    type: 'Higher Secondary',
    staff: { teachers: 25, admin: 6, support: 10 },
    facilities: ['Library', 'Science Labs', 'Computer Lab', 'Hostel', 'Sports Ground'],
    photo: '/uploads/schools/school_6.jpg'
  },
  {
    id: 'school_7',
    name: 'Dr. Babasaheb Ambedkar High School',
    udise: '2712300412',
    address: 'Mukundwadi, Chhatrapati Sambhajinagar',
    contact: '0240-2356789',
    email: 'ambedkar.csb@eduauthority.gov.in',
    headmasterId: 'hm_7',
    headmasterName: 'Vikram Patil',
    headmasterContact: '9876543221',
    established: 1992,
    type: 'Secondary',
    staff: { teachers: 14, admin: 3, support: 5 },
    facilities: ['Library', 'Computer Lab', 'Playground'],
    photo: '/uploads/schools/school_7.jpg'
  },
  {
    id: 'school_8',
    name: 'Podar International School',
    udise: '2712300408',
    address: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    contact: '0240-6688999',
    email: 'podar.csb@eduauthority.gov.in',
    headmasterId: 'hm_8',
    headmasterName: 'Ananya Gupta',
    headmasterContact: '9876543217',
    established: 2005,
    type: 'CBSE',
    staff: { teachers: 22, admin: 7, support: 12 },
    facilities: ['Modern Library', 'STEM Lab', 'Swimming Pool', 'Sports Complex', 'Auditorium'],
    photo: '/uploads/schools/school_8.jpg'
  },
  {
    id: 'school_9',
    name: 'ZP Primary School, Garkheda',
    udise: '2712300401',
    address: 'Garkheda, Chhatrapati Sambhajinagar',
    contact: '0240-2345670',
    email: 'zpgarkheda.csb@eduauthority.gov.in',
    headmasterId: 'hm_9',
    headmasterName: 'Suresh Gaikwad',
    headmasterContact: '9876543222',
    established: 1990,
    type: 'Primary',
    staff: { teachers: 8, admin: 2, support: 3 },
    facilities: ['Library', 'Playground', 'Drinking Water'],
    photo: '/uploads/schools/school_9.jpg'
  },
  {
    id: 'school_10',
    name: 'Dnyanprabodhini School',
    udise: '2712300420',
    address: 'Samarth Nagar, Chhatrapati Sambhajinagar',
    contact: '0240-2338901',
    email: 'dnyanprabodhini.csb@eduauthority.gov.in',
    headmasterId: 'hm_10',
    headmasterName: 'Meera Joshi',
    headmasterContact: '9876543230',
    established: 2000,
    type: 'Secondary',
    staff: { teachers: 16, admin: 4, support: 5 },
    facilities: ['Library', 'Science Lab', 'Art Studio', 'Sports Ground'],
    photo: '/uploads/schools/school_10.jpg'
  },
  {
    id: 'school_11',
    name: 'Ryan International School',
    udise: '2712300421',
    address: 'Paithan Road, Chhatrapati Sambhajinagar',
    contact: '0240-2345672',
    email: 'ryan.csb@eduauthority.gov.in',
    headmasterId: 'hm_11',
    headmasterName: 'David Thomas',
    headmasterContact: '9876543231',
    established: 2008,
    type: 'CBSE',
    staff: { teachers: 20, admin: 6, support: 8 },
    facilities: ['Digital Library', 'Innovation Lab', 'Sports Arena', 'Music Studio'],
    photo: '/uploads/schools/school_11.jpg'
  },
  {
    id: 'school_12',
    name: 'Government Polytechnic School',
    udise: '2712300422',
    address: 'Industrial Area, Chhatrapati Sambhajinagar',
    contact: '0240-2345673',
    email: 'gpt.csb@eduauthority.gov.in',
    headmasterId: 'hm_12',
    headmasterName: 'Rohan Mehta',
    headmasterContact: '9876543232',
    established: 2010,
    type: 'Technical',
    staff: { teachers: 18, admin: 4, support: 6 },
    facilities: ['Tech Lab', 'Robotics Center', 'Coding Studio', 'Innovation Hub'],
    photo: '/uploads/schools/school_12.jpg'
  }
];

// Users (Kendrapramukh + Headmasters)
const users = [
  {
    id: 'admin_1',
    email: 'kendrapramukh@eduauthority.gov.in',
    password: hashPassword('admin123'),
    role: 'kendrapramukh',
    name: 'Kendrapramukh',
    designation: 'District Education Officer',
    zone: 'Central Zone',
    photo: '/uploads/users/admin.jpg'
  },
  ...schools.map((school, index) => ({
    id: school.headmasterId,
    email: `headmaster${index + 1}@school.edu`,
    password: hashPassword('headmaster123'),
    role: 'headmaster',
    name: school.headmasterName,
    schoolId: school.id,
    schoolName: school.name,
    designation: 'Headmaster',
    photo: `/uploads/users/hm_${index + 1}.jpg`
  }))
];

const remoteSchoolPhotos = [
  '/schools/school_1.png',
  '/schools/school_2.png',
  '/schools/school_3.png',
  '/schools/school_4.png',
  '/schools/school_5.png',
  '/schools/school_6.png',
  '/schools/school_7.png',
  '/schools/school_8.png',
  '/schools/school_9.png',
  '/schools/school_10.png',
  '/schools/school_11.png',
  '/schools/school_12.png'
];

const avatarUrl = (name, background = '0F2F5F') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=ffffff&size=256&bold=true`;

schools.forEach((school, index) => {
  school.photo = remoteSchoolPhotos[index % remoteSchoolPhotos.length];
  school.headmasterPhoto = avatarUrl(school.headmasterName, '1E3A5F');
});

users.forEach((user, index) => {
  if (user.role === 'kendrapramukh') {
    user.photo = avatarUrl(user.name, '0B4F6C');
  } else {
    user.photo = avatarUrl(user.name, '1E3A5F');
  }
});

// Attendance Data (Last 30 days)
const generateAttendanceData = () => {
  const data = {};
  schools.forEach(school => {
    data[school.id] = {
      daily: [],
      weekly: [],
      monthly: []
    };
    
    // Generate 30 days of daily attendance
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const baseAttendance = 85 + Math.random() * 15;
      data[school.id].daily.push({
        date: date.toISOString().split('T')[0],
        teachers: Math.min(100, Math.round(baseAttendance + 5 + Math.random() * 5)),
        students: Math.min(100, Math.round(baseAttendance + Math.random() * 10)),
        staff: Math.min(100, Math.round(baseAttendance + 3 + Math.random() * 7)),
        totalPresent: Math.round(school.staff.teachers * (baseAttendance/100)),
        totalCount: school.staff.teachers + 200 + school.staff.support
      });
    }
    
    // Weekly aggregation (last 8 weeks)
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      data[school.id].weekly.push({
        week: `Week ${8-i}`,
        startDate: weekStart.toISOString().split('T')[0],
        teachers: Math.round(88 + Math.random() * 12),
        students: Math.round(85 + Math.random() * 15),
        staff: Math.round(90 + Math.random() * 10)
      });
    }
    
    // Monthly aggregation (last 6 months)
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((month, index) => {
      data[school.id].monthly.push({
        month,
        teachers: Math.round(90 + Math.random() * 10),
        students: Math.round(88 + Math.random() * 12),
        staff: Math.round(92 + Math.random() * 8)
      });
    });
  });
  return data;
};

const attendanceData = generateAttendanceData();

// Government Resolutions (GRs)
const grs = [
  {
    id: 'gr_1',
    title: 'Revised Curriculum 2024',
    circularNumber: 'GR-2024-001',
    description: 'Updated curriculum guidelines for academic year 2024-25',
    fileUrl: '/uploads/gr/revised_curriculum_2024.pdf',
    uploadedBy: 'admin_1',
    uploadedAt: '2023-10-24T10:00:00Z',
    status: 'active',
    viewStatus: schools.reduce((acc, school) => {
      acc[school.id] = { seen: true, seenAt: '2023-10-25T08:30:00Z' };
      return acc;
    }, {})
  },
  {
    id: 'gr_2',
    title: 'Mid-day Meal Safety Guidelines',
    circularNumber: 'GR-2024-002',
    description: 'Mandatory safety protocols for mid-day meal preparation',
    fileUrl: '/uploads/gr/midday_meal_safety.pdf',
    uploadedBy: 'admin_1',
    uploadedAt: '2023-10-22T14:00:00Z',
    status: 'active',
    viewStatus: schools.reduce((acc, school, index) => {
      acc[school.id] = { seen: index < 8, seenAt: index < 8 ? '2023-10-23T09:00:00Z' : null };
      return acc;
    }, {})
  },
  {
    id: 'gr_3',
    title: 'Exam Schedule - Sem II',
    circularNumber: 'GR-2024-003',
    description: 'Second semester examination timetable and guidelines',
    fileUrl: '/uploads/gr/exam_schedule_sem2.pdf',
    uploadedBy: 'admin_1',
    uploadedAt: '2023-10-18T09:30:00Z',
    status: 'active',
    viewStatus: schools.reduce((acc, school, index) => {
      acc[school.id] = { seen: index < 10, seenAt: index < 10 ? '2023-10-19T10:00:00Z' : null };
      return acc;
    }, {})
  },
  {
    id: 'gr_4',
    title: 'Digital Literacy Integration Protocol',
    circularNumber: 'GR-2024-004',
    description: 'Integration of digital tools in primary education',
    fileUrl: '/uploads/gr/digital_literacy.pdf',
    uploadedBy: 'admin_1',
    uploadedAt: new Date().toISOString(),
    status: 'active',
    viewStatus: schools.reduce((acc, school, index) => {
      acc[school.id] = { seen: index < 3, seenAt: index < 3 ? new Date().toISOString() : null };
      return acc;
    }, {})
  }
];

// Events/Programs
const events = [
  {
    id: 'event_1',
    name: 'Innovative Science Fair 2023',
    description: 'Annual science exhibition showcasing student projects',
    type: 'innovative',
    startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 172800000).toISOString(),
    venue: 'District Central Hall',
    organizedBy: 'admin_1',
    status: 'upcoming',
    photo: '/uploads/events/science_fair.jpg',
    coverPhoto: '/uploads/events/science_fair_cover.jpg',
    schools: schools.map(s => s.id),
    submissions: schools.reduce((acc, school, index) => {
      if (index < 8) {
        acc[school.id] = {
          submitted: true,
          submittedAt: new Date(Date.now() - 86400000 * (index + 1)).toISOString(),
          photos: ['/uploads/events/submissions/science_fair_1.jpg'],
          report: 'Students participated enthusiastically with innovative projects',
          completionDate: new Date(Date.now() - 86400000).toISOString()
        };
      }
      return acc;
    }, {})
  },
  {
    id: 'event_2',
    name: 'Annual Sports Meet Safety Guidelines',
    description: 'Safety protocols for organizing annual sports events',
    type: 'program',
    startDate: '2023-11-15T00:00:00Z',
    endDate: '2023-11-20T00:00:00Z',
    venue: 'District Stadium',
    organizedBy: 'admin_1',
    status: 'ongoing',
    photo: '/uploads/events/sports_meet.jpg',
    schools: schools.map(s => s.id),
    submissions: {}
  },
  {
    id: 'event_3',
    name: 'STEM Catalyst Project',
    description: 'District-wide initiative integrating robotics and AI into middle school curriculum',
    type: 'innovative',
    startDate: '2023-09-01T00:00:00Z',
    endDate: '2024-03-31T00:00:00Z',
    venue: 'Multiple Schools',
    organizedBy: 'admin_1',
    status: 'ongoing',
    photo: '/uploads/events/stem_catalyst.jpg',
    coverPhoto: '/uploads/events/stem_catalyst_cover.jpg',
    schools: ['school_8', 'school_11', 'school_12', 'school_2'],
    submissions: {
      'school_8': {
        submitted: true,
        submittedAt: '2023-10-20T10:00:00Z',
        photos: ['/uploads/events/submissions/stem_1.jpg'],
        report: 'Excellent participation from Class 8-10 students',
        completionDate: '2023-10-20T10:00:00Z'
      },
      'school_12': {
        submitted: true,
        submittedAt: '2023-10-22T14:00:00Z',
        photos: ['/uploads/events/submissions/stem_2.jpg'],
        report: 'Students engaged in real-world problem-solving challenges',
        completionDate: '2023-10-22T14:00:00Z'
      }
    }
  }
];

const remoteEventPhotos = [
  {
    photo: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80'
  },
  {
    photo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1400&q=80'
  },
  {
    photo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80'
  }
];

events.forEach((event, index) => {
  event.photo = remoteEventPhotos[index % remoteEventPhotos.length].photo;
  event.coverPhoto = remoteEventPhotos[index % remoteEventPhotos.length].coverPhoto;

  Object.values(event.submissions || {}).forEach((submission, submissionIndex) => {
    submission.photos = [
      `https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80&sig=${index + submissionIndex + 1}`
    ];
  });
});

// Meetings
const meetings = [
  {
    id: 'meeting_1',
    title: 'Board of Governors Meeting',
    type: 'offline',
    date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    time: '11:00 AM',
    venue: 'Room 4B, District Office',
    agenda: 'Review quarterly progress, budget allocation, infrastructure updates',
    organizedBy: 'admin_1',
    status: 'scheduled',
    schoolResponses: schools.reduce((acc, school, index) => {
      acc[school.id] = { 
        status: index < 10 ? 'accepted' : 'pending', 
        respondedAt: index < 10 ? new Date().toISOString() : null 
      };
      return acc;
    }, {})
  },
  {
    id: 'meeting_2',
    title: 'Headmasters Review Meeting',
    type: 'online',
    date: new Date(Date.now() + 604800000).toISOString(), // Next week
    time: '02:00 PM',
    venue: 'Google Meet',
    link: 'https://meet.google.com/abc-defg-hij',
    agenda: 'Academic performance review, attendance analysis',
    organizedBy: 'admin_1',
    status: 'scheduled',
    schoolResponses: schools.reduce((acc, school) => {
      acc[school.id] = { status: 'pending', respondedAt: null };
      return acc;
    }, {})
  }
];

// Reporting Forms
const reportForms = [
  {
    id: 'form_1',
    title: 'Nipun Bharat Abhiyan Implementation',
    description: 'Report on foundational literacy and numeracy program',
    createdBy: 'admin_1',
    createdAt: '2023-10-20T10:00:00Z',
    deadline: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
    fields: [
      { id: 'schoolName', label: 'School Name', type: 'select', required: true },
      { id: 'programImplemented', label: 'Program Implemented', type: 'boolean', required: true },
      { id: 'implementationDate', label: 'Date of Implementation', type: 'date', required: true },
      { id: 'studentsParticipated', label: 'Students Participated', type: 'number', required: true },
      { id: 'photosUploaded', label: 'Photos Uploaded', type: 'boolean', required: false },
      { id: 'remarks', label: 'Remarks', type: 'textarea', required: false }
    ],
    responses: {
      'school_1': {
        schoolName: "St. Xavier's High School, Chhatrapati Sambhajinagar",
        programImplemented: true,
        implementationDate: '2023-10-22',
        studentsParticipated: 150,
        photosUploaded: true,
        remarks: 'Program successfully implemented with 95% participation',
        submittedAt: '2023-10-23T10:00:00Z',
        status: 'completed'
      },
      'school_2': {
        schoolName: 'Carmel Convent High School',
        programImplemented: true,
        implementationDate: '2023-10-21',
        studentsParticipated: 200,
        photosUploaded: true,
        remarks: 'Excellent response from students',
        submittedAt: '2023-10-22T14:00:00Z',
        status: 'completed'
      },
      'school_6': {
        schoolName: 'Shivaji High School',
        programImplemented: true,
        implementationDate: '2023-10-20',
        studentsParticipated: 180,
        photosUploaded: false,
        remarks: 'Implementation ongoing',
        submittedAt: '2023-10-21T09:00:00Z',
        status: 'completed'
      }
    }
  },
  {
    id: 'form_2',
    title: 'Weekly Teacher Appraisal',
    description: 'Teacher performance and attendance review',
    createdBy: 'admin_1',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 172800000).toISOString(),
    status: 'active',
    fields: [
      { id: 'schoolName', label: 'School Name', type: 'select', required: true },
      { id: 'teachersPresent', label: 'Teachers Present', type: 'number', required: true },
      { id: 'totalTeachers', label: 'Total Teachers', type: 'number', required: true },
      { id: 'remarks', label: 'Remarks', type: 'textarea', required: false }
    ],
    responses: {}
  },
  {
    id: 'form_3',
    title: 'Infrastructure Inventory',
    description: 'Monthly infrastructure audit report',
    createdBy: 'admin_1',
    createdAt: '2023-10-15T09:00:00Z',
    deadline: new Date(Date.now() + 432000000).toISOString(),
    status: 'active',
    fields: [
      { id: 'schoolName', label: 'School Name', type: 'select', required: true },
      { id: 'classroomsFunctional', label: 'Classrooms Functional', type: 'number', required: true },
      { id: 'repairsNeeded', label: 'Repairs Needed', type: 'textarea', required: false },
      { id: 'photos', label: 'Photos', type: 'file', required: false }
    ],
    responses: {}
  }
];

// Notifications
const notifications = [];

// Toppers Data
const toppers = [
  { id: 'topper_1', name: 'Aarav Patil', class: 'Class 10', percentage: 99.4, schoolId: 'school_2', photo: '/uploads/toppers/topper_1.jpg' },
  { id: 'topper_2', name: 'Saanvi Deshmukh', class: 'Class 10', percentage: 98.2, schoolId: 'school_8', photo: '/uploads/toppers/topper_2.jpg' },
  { id: 'topper_3', name: 'Omkar Jadhav', class: 'Class 12', percentage: 97.8, schoolId: 'school_4', photo: '/uploads/toppers/topper_3.jpg' },
  { id: 'topper_4', name: 'Isha Kulkarni', class: 'Class 12', percentage: 96.5, schoolId: 'school_11', photo: '/uploads/toppers/topper_4.jpg' },
  { id: 'topper_5', name: 'Rohan Shinde', class: 'Class 10', percentage: 95.8, schoolId: 'school_6', photo: '/uploads/toppers/topper_5.jpg' },
  { id: 'topper_6', name: 'Prachi Pawar', class: 'Class 12', percentage: 94.5, schoolId: 'school_2', photo: '/uploads/toppers/topper_6.jpg' },
  { id: 'topper_7', name: 'Aditya More', class: 'Class 10', percentage: 93.8, schoolId: 'school_1', photo: '/uploads/toppers/topper_7.jpg' },
  { id: 'topper_8', name: 'Sneha Joshi', class: 'Class 12', percentage: 92.5, schoolId: 'school_3', photo: '/uploads/toppers/topper_8.jpg' },
  { id: 'topper_9', name: 'Tanmay Chavan', class: 'Class 10', percentage: 91.2, schoolId: 'school_5', photo: '/uploads/toppers/topper_9.jpg' },
  { id: 'topper_10', name: 'Neha Kale', class: 'Class 12', percentage: 90.5, schoolId: 'school_7', photo: '/uploads/toppers/topper_10.jpg' },
  { id: 'topper_11', name: 'Kunal Gaikwad', class: 'Class 10', percentage: 89.8, schoolId: 'school_9', photo: '/uploads/toppers/topper_11.jpg' },
  { id: 'topper_12', name: 'Pooja Mane', class: 'Class 12', percentage: 88.5, schoolId: 'school_10', photo: '/uploads/toppers/topper_12.jpg' }
];

toppers.forEach((topper, index) => {
  topper.photo = avatarUrl(topper.name, '6D28D9');
});

// Staff photos for public display
const staffPhotos = schools.reduce((acc, school, index) => {
  acc[school.id] = [
    avatarUrl(`${school.name} Staff 1`, '0F766E'),
    avatarUrl(`${school.name} Staff 2`, '0369A1'),
    avatarUrl(`${school.name} Staff 3`, '7C3AED')
  ];
  return acc;
}, {});

// Data Store Export
const dataStore = {
  schools,
  users,
  attendanceData,
  grs,
  events,
  meetings,
  reportForms,
  notifications,
  toppers,
  staffPhotos,
  
  // Helper methods
  getUserByEmail(email) {
    return this.users.find(u => u.email === email);
  },
  
  getUserById(id) {
    return this.users.find(u => u.id === id);
  },
  
  getSchoolById(id) {
    return this.schools.find(s => s.id === id);
  },
  
  getGRById(id) {
    return this.grs.find(g => g.id === id);
  },
  
  getEventById(id) {
    return this.events.find(e => e.id === id);
  },
  
  getMeetingById(id) {
    return this.meetings.find(m => m.id === id);
  },
  
  getFormById(id) {
    return this.reportForms.find(f => f.id === id);
  },
  
  addNotification(notification) {
    this.notifications.unshift({
      id: uuidv4(),
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    });
  },
  
  // Reset method for testing
  reset() {
    // Re-initialize with fresh data if needed
  }
};

module.exports = dataStore;
