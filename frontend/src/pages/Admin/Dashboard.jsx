import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileCheck, 
  Calendar, 
  ChevronRight,
  Download,
  Upload,
  Plus,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../../components/Cards/StatCard';
import SchoolCard from '../../components/Cards/SchoolCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalGRs: 0,
    totalEvents: 0,
    totalMeetings: 0
  });
  const [grs, setGrs] = useState([]);
  const [schools, setSchools] = useState([]);
  const [events, setEvents] = useState([]);
  const [headmasterActivity, setHeadmasterActivity] = useState([]);
  
  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await axios.get(`${API_URL}/admin/stats`, { headers });
      setStats(statsRes.data);
      
      // Fetch GRs
      const grsRes = await axios.get(`${API_URL}/grs?limit=3`, { headers });
      setGrs(grsRes.data.grs || []);
      
      // Fetch schools
      const schoolsRes = await axios.get(`${API_URL}/schools`, { headers });
      setSchools(schoolsRes.data.schools?.slice(0, 4) || []);
      
      // Fetch events
      const eventsRes = await axios.get(`${API_URL}/events?status=upcoming,ongoing`, { headers });
      setEvents(eventsRes.data.events || []);
      
      // Fetch headmaster activity (GR seen status, meeting responses)
      const grsList = grsRes.data.grs || [];
      const meetingsRes = await axios.get(`${API_URL}/meetings/stats`, { headers });
      
      // Combine activity data from GRs and meetings
      const activity = [];
      grsList.forEach(gr => {
        if (gr.viewStatus) {
          Object.entries(gr.viewStatus).forEach(([schoolId, status]) => {
            const school = schoolsRes.data.schools?.find(s => s.id === schoolId);
            if (school) {
              activity.push({
                type: 'gr',
                schoolName: school.name,
                headmasterName: school.headmasterName,
                itemTitle: gr.title,
                status: status?.seen ? 'seen' : 'not_seen',
                date: status?.seenAt || gr.uploadedAt
              });
            }
          });
        }
      });
      
      meetingsRes.data.responses?.forEach(meeting => {
        if (meeting.schoolResponses) {
          Object.entries(meeting.schoolResponses).forEach(([schoolId, response]) => {
            const school = schoolsRes.data.schools?.find(s => s.id === schoolId);
            if (school && response.status !== 'pending') {
              activity.push({
                type: 'meeting',
                schoolName: school.name,
                headmasterName: school.headmasterName,
                itemTitle: meeting.meetingTitle || meeting.title,
                status: response.status,
                date: response.respondedAt
              });
            }
          });
        }
      });
      
      setHeadmasterActivity(activity.slice(0, 10));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };
  
  // Handle download GR
  const handleDownloadGR = (gr) => {
    if (gr.fileUrl) {
      window.open(`${API_URL.replace('/api', '')}${gr.fileUrl}`, '_blank');
    } else {
      toast.info('Download functionality will be available when file is uploaded');
    }
  };

  // Stats data using real API data
  const statsData = [
    { 
      title: 'Total Schools', 
      value: stats.totalSchools || 0, 
      icon: Users
    },
    { 
      title: 'Active GRs', 
      value: stats.totalGRs || 0, 
      icon: FileCheck
    },
    { 
      title: 'Active Events', 
      value: stats.totalEvents || 0, 
      icon: Calendar,
      className: 'bg-navy-500 text-white'
    },
  ];

  const complianceData = headmasterActivity.map(item => ({
    school: item.schoolName,
    headmaster: item.headmasterName,
    lastReport: new Date(item.date).toLocaleDateString(),
    status: item.type === 'gr' 
      ? (item.status === 'seen' ? 'seen' : 'not_seen')
      : item.status,
    type: item.type
  }));

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.executiveOverview')}</h1>
          <p className="text-slate-500 mt-1">{t('dashboard.managingSchools', { count: 12, zone: 'Central Zone' })}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/meetings', { state: { openCreateModal: true } })}
            className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-xl font-medium hover:bg-teal-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('nav.createMeeting')}
          </button>
          <button 
            onClick={() => navigate('/admin/grs', { state: { openUploadModal: true } })}
            className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {t('nav.uploadGR')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Institution Roster */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">{t('dashboard.institutionRoster')}</h3>
              <button 
                onClick={() => navigate('/admin/attendance')}
                className="text-sm text-navy-500 font-medium flex items-center gap-1 hover:text-navy-600"
              >
                {t('nav.viewAllSchools')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(schools.length > 0 ? schools : [
                { id: 1, name: 'Z.P. Primary School, Khed', status: 'submitted', time: '10:30 AM' },
                { id: 2, name: 'Modern English High School', status: 'submitted', time: 'Yesterday' },
                { id: 3, name: 'Navbharat Vidyalaya', status: 'pending', time: 'Due 4h' },
                { id: 4, name: "St. Mary's Convent", status: 'submitted', time: '9:15 AM' },
              ]).map((school) => (
                <SchoolCard key={school.id} school={school} status={school.status} />
              ))}
            </div>

            <button 
              onClick={() => navigate('/admin/attendance')}
              className="w-full mt-4 py-3 bg-sky-50 hover:bg-sky-100 text-sky-600 font-medium rounded-xl transition-colors"
            >
              + 8 more institutions being monitored
            </button>
          </div>
        </div>

        {/* Recent GRs */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-slate-800 mb-6">{t('dashboard.recentGRs')}</h3>
            <div className="space-y-4">
              {(grs.length > 0 ? grs.slice(0, 3) : [
                { id: 1, title: 'Revised Curriculum 2024', uploadedAt: '2023-10-24', size: '2.4 MB' },
                { id: 2, title: 'Mid-day Meal Safety Guidelines', uploadedAt: '2023-10-22', size: '1.1 MB' },
                { id: 3, title: 'Exam Schedule - Sem II', uploadedAt: '2023-10-18', size: '800 KB' },
              ]).map((gr, index) => (
                <div key={gr.id || index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{gr.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(gr.uploadedAt).toLocaleDateString()} • {gr.size || '1.2 MB'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDownloadGR(gr)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-slate-400 hover:text-navy-500" />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/admin/grs')}
              className="w-full mt-4 py-2 text-navy-500 font-medium hover:bg-navy-50 rounded-lg transition-colors"
            >
              {t('reports.viewGovernmentArchive')}
            </button>
          </div>
        </div>
      </div>

      {/* Next Event & Report Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Event */}
        <div className="bg-navy-500 rounded-2xl p-6 text-white">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4">
            {t('dashboard.nextEvent')}
          </span>
          <h3 className="text-xl font-bold mb-2">
            {events[0]?.name || 'Innovative Science Fair 2023'}
          </h3>
          <p className="text-navy-200 text-sm mb-4">
            {events[0]?.venue || 'District Central Hall'} • {events[0]?.startDate ? new Date(events[0].startDate).toLocaleDateString() : 'Tomorrow, 11 AM'}
          </p>
          <button 
            onClick={() => navigate('/admin/events')}
            className="w-full py-3 bg-white text-navy-600 font-semibold rounded-xl hover:bg-navy-50 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {t('dashboard.manageRegistrations')}
          </button>
        </div>

        {/* Headmaster Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Headmaster Activity</h3>
              <p className="text-sm text-slate-500">Recent actions from headmasters</p>
            </div>
          </div>
          <div className="space-y-3">
            {headmasterActivity.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  item.status === 'seen' || item.status === 'accepted' ? 'bg-green-500' :
                  item.status === 'not_seen' || item.status === 'pending' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.schoolName}</p>
                  <p className="text-xs text-slate-500 truncate">{item.type}: {item.itemTitle}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.status === 'seen' || item.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  item.status === 'not_seen' || item.status === 'pending' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            ))}
            {headmasterActivity.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

      </div>

      {/* Headmaster Compliance */}
      <div className="bg-sky-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800">Headmaster Compliance</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Seen/Accepted</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Tentative</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Not Seen/Pending</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-4">Institution</th>
                <th className="pb-4">Headmaster</th>
                <th className="pb-4">Type</th>
                <th className="pb-4">Item</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {complianceData.map((item, index) => (
                <tr key={index} className="border-t border-slate-200">
                  <td className="py-4 font-medium text-slate-800">{item.school}</td>
                  <td className="py-4 text-slate-600">{item.headmaster}</td>
                  <td className="py-4 text-slate-600 capitalize">{item.type}</td>
                  <td className="py-4 text-slate-600 truncate max-w-xs">{item.itemTitle}</td>
                  <td className="py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'seen' || item.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      item.status === 'tentative' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-slate-600">{item.lastReport}</td>
                </tr>
              ))}
              {complianceData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No compliance data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
