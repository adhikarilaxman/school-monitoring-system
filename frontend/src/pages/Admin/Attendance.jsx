import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import AttendanceChart from '../../components/Charts/AttendanceChart';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminAttendance = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [districtAverage, setDistrictAverage] = useState({ teachers: 0, students: 0, staff: 0 });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/attendance/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payload = response.data || {};
      setDistrictAverage(payload.districtAverage || { teachers: 0, students: 0, staff: 0 });
      setAttendanceData({
        daily: payload.daily || [],
        weekly: payload.weekly || [],
        monthly: payload.monthly || []
      });
      setSchools((payload.summary || []).map((school) => ({
        id: school.schoolId,
        name: school.schoolName,
        attendance: school.attendance?.students || 0
      })));
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast.error('Failed to load attendance analytics');
    } finally {
      setLoading(false);
    }
  };

  const headline = useMemo(() => {
    return period === 'daily'
      ? `${districtAverage.students}% district average today`
      : period === 'weekly'
        ? `${districtAverage.teachers}% teacher attendance average`
        : `${districtAverage.staff}% staff attendance average`;
  }, [districtAverage, period]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('attendance.attendanceAnalytics')}</h1>
        <p className="mt-1 text-slate-500">{headline}</p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-navy-500" />
          <p className="mt-2 text-slate-500">Loading attendance data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">{t('attendance.attendanceOversight')}</h3>
                <p className="text-sm text-slate-500">{t('attendance.realTimeTracking')}</p>
              </div>
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly'].map((value) => (
                  <button
                    key={value}
                    onClick={() => setPeriod(value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      period === value ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <AttendanceChart data={attendanceData[period] || []} type="bar" period={period} />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="mb-6 font-bold text-slate-800">School Attendance</h3>
            <div className="space-y-4">
              {schools.map((school) => (
                <div key={school.id} className="rounded-xl bg-navy-500 p-4 text-white">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium opacity-80">{school.name}</span>
                    <span className="text-xs font-bold">{school.attendance}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-lg bg-navy-400">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-300"
                      style={{ width: `${school.attendance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
