import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Loader2, Users, X } from 'lucide-react';
import AttendanceChart from '../../components/Charts/AttendanceChart';
import StatCard from '../../components/Cards/StatCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HMAttendance = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [period, setPeriod] = useState('daily');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [schoolName, setSchoolName] = useState(user?.schoolName || '');
  const [loading, setLoading] = useState(true);
  const [markLoading, setMarkLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState({
    teachersPresent: 0,
    teachersTotal: 20,
    studentsPresent: 0,
    studentsTotal: 200,
    staffPresent: 0,
    staffTotal: 10
  });

  useEffect(() => {
    fetchAttendanceData(period);
  }, [period]);

  const fetchAttendanceData = async (selectedPeriod) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/attendance/my-attendance?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payload = response.data || {};
      const currentSummary = payload.summary || {};
      const currentData = payload.data || [];
      const latestDaily = selectedPeriod === 'daily' ? currentData[currentData.length - 1] : null;

      setSchoolName(payload.schoolName || user?.schoolName || '');
      setSummary(currentSummary);
      setAttendanceData(currentData);

      if (selectedPeriod === 'daily' && latestDaily) {
        setTodayAttendance((prev) => ({
          ...prev,
          teachersPresent: Math.round(((latestDaily.teachers || 0) / 100) * prev.teachersTotal),
          studentsPresent: Math.round(((latestDaily.students || 0) / 100) * prev.studentsTotal),
          staffPresent: Math.round(((latestDaily.staff || 0) / 100) * prev.staffTotal)
        }));
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (event) => {
    event.preventDefault();
    setMarkLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        date: new Date().toISOString().split('T')[0],
        teachersPresent: Number(todayAttendance.teachersPresent),
        teachersTotal: Number(todayAttendance.teachersTotal),
        studentsPresent: Number(todayAttendance.studentsPresent),
        studentsTotal: Number(todayAttendance.studentsTotal),
        staffPresent: Number(todayAttendance.staffPresent),
        staffTotal: Number(todayAttendance.staffTotal)
      };

      await axios.post(`${API_URL}/attendance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Attendance marked successfully');
      setShowMarkModal(false);
      fetchAttendanceData(period);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTodayAttendance((prev) => ({ ...prev, [field]: value }));
  };

  const currentDaily = summary?.current || {};
  const average = summary?.average || {};
  const todayAttendancePercent = currentDaily.students ?? average.students ?? 0;
  const teacherValue = `${todayAttendance.teachersPresent}/${todayAttendance.teachersTotal}`;
  const studentValue = `${todayAttendance.studentsPresent}/${todayAttendance.studentsTotal}`;

  const updatedLabel = useMemo(() => {
    if (!currentDaily.date) {
      return 'No daily record yet';
    }
    return `Updated ${new Date(currentDaily.date).toLocaleDateString()}`;
  }, [currentDaily.date]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('attendance.title')}</h1>
          <p className="mt-1 text-slate-500">{schoolName}</p>
        </div>
        <button 
          onClick={() => setShowMarkModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <Calendar className="h-4 w-4" />
          Mark Today's Attendance
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-navy-500" />
          <p className="mt-2 text-slate-500">Loading attendance...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              title="Today's Attendance"
              value={`${todayAttendancePercent}%`}
              subtitle={updatedLabel}
            />
            <StatCard
              title={t('attendance.teachers')}
              value={teacherValue}
              subtitle={`Average ${average.teachers ?? 0}%`}
              icon={Users}
            />
            <StatCard
              title={t('attendance.students')}
              value={studentValue}
              subtitle={`Average ${average.students ?? 0}%`}
              icon={Users}
            />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">{t('attendance.attendanceAnalytics')}</h3>
                <p className="text-sm text-slate-500">Track your school attendance over time</p>
              </div>
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly'].map((value) => (
                  <button
                    key={value}
                    onClick={() => setPeriod(value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      period === value ? 'bg-navy-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <AttendanceChart data={attendanceData} type="bar" period={period} />
          </div>
        </>
      )}

      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h3 className="font-bold text-slate-800">Mark Today's Attendance</h3>
              <button onClick={() => setShowMarkModal(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleMarkAttendance} className="space-y-4 p-6">
              {[
                { label: 'Teachers', present: 'teachersPresent', total: 'teachersTotal' },
                { label: 'Students', present: 'studentsPresent', total: 'studentsTotal' },
                { label: 'Staff', present: 'staffPresent', total: 'staffTotal' }
              ].map((group) => (
                <div key={group.label} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h4 className="mb-3 font-medium text-slate-700">{group.label}</h4>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Present</label>
                    <input
                      type="number"
                      min="0"
                      value={todayAttendance[group.present]}
                      onChange={(e) => handleInputChange(group.present, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Total</label>
                    <input
                      type="number"
                      min="1"
                      value={todayAttendance[group.total]}
                      onChange={(e) => handleInputChange(group.total, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500"
                      required
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={markLoading}
                  className="flex-1 rounded-xl bg-navy-500 px-4 py-2 font-medium text-white disabled:opacity-50"
                >
                  {markLoading ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HMAttendance;
