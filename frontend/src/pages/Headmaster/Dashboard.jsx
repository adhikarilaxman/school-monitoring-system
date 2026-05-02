import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  CheckCircle2,
  Clock,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import AttendanceChart from '../../components/Charts/AttendanceChart';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const HMDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [grs, setGrs] = useState([]);
  const [forms, setForms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('Daily');
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    teachersPresent: 48,
    teachersTotal: 52,
    studentsPresent: 186,
    studentsTotal: 200,
    overall: 94.2
  });

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch GRs
      const grsRes = await axios.get(`${API_URL}/grs`, { headers });
      setGrs(grsRes.data.grs?.slice(0, 3) || []);
      
      // Fetch forms/reports
      const formsRes = await axios.get(`${API_URL}/reports`, { headers });
      setForms((formsRes.data.forms || []).filter(form => !form.isSubmitted).slice(0, 2));
      
      // Fetch notifications
      const notifRes = await axios.get(`${API_URL}/notifications?limit=5`, { headers });
      setNotifications(notifRes.data.notifications || []);
      
      // Fetch attendance stats
      const attendanceRes = await axios.get(`${API_URL}/attendance/my-attendance`, { headers });
      if (attendanceRes.data?.summary) {
        const summary = attendanceRes.data.summary;
        const current = summary.current || {};
        setAttendanceData(attendanceRes.data.data || []);
        setAttendanceStats({
          teachersPresent: current.totalPresent ? Math.round((current.teachers / 100) * 52) : 48,
          teachersTotal: 52,
          studentsPresent: current.totalCount ? Math.round((current.students / 100) * 200) : 186,
          studentsTotal: 200,
          overall: summary.average?.students || current.students || 94.2
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleFillForm = (formId) => {
    navigate(`/hm/reporting?formId=${formId}`);
  };

  const handleStartProject = () => {
    navigate('/hm/events');
  };

  const handleMarkGRSeen = async (grId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/grs/${grId}/seen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
      toast.success('Marked as seen');
    } catch (error) {
      toast.error('Failed to mark as seen');
    }
  };

  const getChartData = () => {
    if (attendanceData.length > 0 && chartPeriod === 'Daily') {
      return attendanceData.slice(-7).map((entry) => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
        teachers: entry.teachers,
        students: entry.students,
        staff: entry.staff
      }));
    }

    const data = {
      Daily: [
        { date: 'Mon', teachers: 95, students: 92, staff: 94 },
        { date: 'Tue', teachers: 96, students: 93, staff: 95 },
        { date: 'Wed', teachers: 94, students: 91, staff: 93 },
        { date: 'Thu', teachers: 97, students: 94, staff: 96 },
        { date: 'Fri', teachers: 95, students: 92, staff: 94 },
        { date: 'Sat', teachers: 93, students: 90, staff: 92 },
        { date: 'Sun', teachers: 92, students: 89, staff: 91 },
      ],
      Weekly: [
        { date: 'Week 1', teachers: 94, students: 91, staff: 93 },
        { date: 'Week 2', teachers: 96, students: 93, staff: 95 },
        { date: 'Week 3', teachers: 95, students: 92, staff: 94 },
        { date: 'Week 4', teachers: 97, students: 94, staff: 96 },
      ],
      Monthly: [
        { date: 'Jan', teachers: 93, students: 90, staff: 92 },
        { date: 'Feb', teachers: 94, students: 91, staff: 93 },
        { date: 'Mar', teachers: 95, students: 92, staff: 94 },
        { date: 'Apr', teachers: 96, students: 93, staff: 95 },
        { date: 'May', teachers: 94, students: 91, staff: 93 },
        { date: 'Jun', teachers: 95, students: 92, staff: 94 },
      ]
    };
    return data[chartPeriod] || data['Daily'];
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.attendanceOversight')}</h1>
          <p className="text-slate-500 mt-1">{t('attendance.realTimeTracking')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-navy-500">{attendanceStats.overall}%</span>
                <span className="text-sm text-green-500 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2.4% {t('attendance.vsYesterday')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {['Daily', 'Weekly', 'Monthly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === chartPeriod ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <AttendanceChart data={getChartData()} type="bar" period={chartPeriod.toLowerCase()} />
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{t('attendance.facultyPresent')}</span>
              <span className="text-lg font-bold text-navy-500">{attendanceStats.teachersPresent} / {attendanceStats.teachersTotal}</span>
            </div>
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-navy-500 rounded-full" 
                style={{ width: `${(attendanceStats.teachersPresent / attendanceStats.teachersTotal) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Alerts/Notifications */}
        <div className="bg-navy-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold">Notifications</h3>
            <span className="px-2 py-1 bg-white/20 rounded text-xs font-semibold">
              {notifications.filter(n => !n.read).length} NEW
            </span>
          </div>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-navy-200 text-center py-4">No notifications</p>
            ) : (
              notifications.slice(0, 5).map((notif, index) => (
                <div key={index} className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      notif.type === 'gr' ? 'bg-green-400' :
                      notif.type === 'meeting' ? 'bg-teal-400' :
                      notif.type === 'event' ? 'bg-purple-400' :
                      'bg-blue-400'
                    }`}>
                      {notif.type === 'gr' && <FileText className="w-4 h-4 text-navy-700" />}
                      {notif.type === 'meeting' && <Calendar className="w-4 h-4 text-navy-700" />}
                      {notif.type === 'event' && <FileCheck className="w-4 h-4 text-navy-700" />}
                      {!['gr', 'meeting', 'event'].includes(notif.type) && <Clock className="w-4 h-4 text-navy-700" />}
                    </div>
                    <span className={`font-medium text-sm ${notif.read ? 'opacity-70' : ''}`}>{notif.title}</span>
                  </div>
                  <p className="text-xs text-navy-200">{notif.message}</p>
                  <p className="text-xs text-navy-300 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => navigate('/hm/grs')}
            className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            View All Notifications
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GR Checklist */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{t('dashboard.governmentResolution')}</h3>
              <p className="text-sm text-slate-500">{t('dashboard.checklist')} • 4 Pending</p>
            </div>
          </div>
          <div className="space-y-3">
            {grs.length === 0 ? (
              <p className="text-sm text-slate-500 p-3">No GRs available</p>
            ) : (
              grs.map((gr, index) => {
                const isSeen = gr.myStatus?.seen || gr.seen || false;
                return (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => !isSeen && handleMarkGRSeen(gr.id)}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSeen ? 'bg-navy-500' : 'bg-white border-2 border-slate-300'}`}>
                      {isSeen && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-sm flex-1 ${isSeen ? 'text-slate-700' : 'text-slate-500'}`}>{gr.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${isSeen ? 'bg-navy-100 text-navy-600' : 'bg-red-100 text-red-600'}`}>
                      {isSeen ? 'SEEN' : 'NOT SEEN'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Report Forms & Event Submission */}
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 mb-4">{t('dashboard.criticalReportForms')}</h3>
            <div className="space-y-4">
              {forms.length === 0 ? (
                <p className="text-sm text-slate-500">No forms pending</p>
              ) : (
                forms.map((form, index) => (
                  <div key={index} className="bg-white rounded-2xl p-5 shadow-card border-l-4 border-navy-500">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <FileCheck className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm">{form.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Due: {new Date(form.deadline).toLocaleDateString()}</p>
                    <button 
                      onClick={() => handleFillForm(form.id)}
                      className="w-full mt-3 py-2 bg-sky-100 text-sky-700 text-sm font-medium rounded-lg hover:bg-sky-200 transition-colors"
                    >
                      {t('dashboard.fillForm')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-navy-500 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold">{t('dashboard.innovativeEventSubmission')}</h3>
                <p className="text-sm text-navy-200 mt-1">{t('dashboard.shareInitiative')}</p>
              </div>
            </div>
            <button 
              onClick={handleStartProject}
              className="px-6 py-2 bg-white text-navy-600 rounded-xl font-semibold hover:bg-navy-50 transition-colors text-sm"
            >
              {t('dashboard.startProject')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HMDashboard;
