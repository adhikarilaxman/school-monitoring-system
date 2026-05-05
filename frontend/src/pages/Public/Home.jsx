import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ChevronRight, GraduationCap, Image as ImageIcon, MapPin, Star, TrendingUp, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE = API_URL.replace('/api', '');

const assetUrl = (value) => {
  if (!value) return null;
  if (value?.startsWith('/uploads')) return `${API_BASE}${value}`;
  if (value?.startsWith('http')) return value;
  return value;
};

const PublicHome = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schoolsResponse, attendanceResponse, statsResponse, programsResponse] = await Promise.all([
          axios.get(`${API_URL}/public/schools`),
          axios.get(`${API_URL}/public/attendance`),
          axios.get(`${API_URL}/public/stats`),
          axios.get(`${API_URL}/public/programs`),
        ]);

        setSchools((schoolsResponse.data.schools || []).slice(0, 6));
        setAttendance((attendanceResponse.data.schools || []).slice(0, 4));
        setStats(statsResponse.data);
        setPrograms((programsResponse.data.programs || []).slice(0, 3));
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to load public dashboard data', error);
        }
        toast.error('Failed to load some content. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const heroStats = useMemo(
    () => [
      { label: 'Schools', value: stats?.totalSchools ?? 12, icon: Building2 },
      { label: 'Staff', value: stats?.totalStaff ?? 0, icon: Users },
      { label: 'Attendance', value: `${stats?.districtAttendance ?? 0}%`, icon: TrendingUp },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-navy-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300 mb-4">Cluster Education Portal</p>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl mb-4">Loading...</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-white">
          <LoadingSpinner text="Loading content..." size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <section className="bg-navy-500 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Cluster Education Portal</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">School information, attendance visibility, and program reporting in one place.</h1>
            <p className="mt-5 max-w-2xl text-lg text-navy-100">
              Parents and students can explore schools, innovative programs, toppers, and attendance trends without login.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <NavLink to="/schools" className="rounded-xl bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600">
                View All Schools
              </NavLink>
              <NavLink to="/programs" className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20">
                View Programs
              </NavLink>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                      <Icon className="h-5 w-5 text-teal-300" />
                    </div>
                    <div>
                      <p className="text-sm text-navy-100">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t('attendance.attendanceAnalytics')}</h2>
              <p className="text-slate-500">View-only attendance snapshot across the cluster.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {attendance.map((school) => (
              <div key={school.schoolId} className="rounded-2xl bg-slate-50 p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{school.schoolName}</h3>
                    <p className="text-sm text-slate-500">Monthly avg {school.monthlyAverage}%</p>
                  </div>
                  <span className="rounded-full bg-navy-500 px-3 py-1 text-xs font-semibold text-white">
                    {school.currentAttendance}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${school.currentAttendance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Schools Directory</h2>
              <p className="text-slate-500">Every school under the Kendrapramukh cluster.</p>
            </div>
            <NavLink to="/schools" className="inline-flex items-center gap-1 font-medium text-navy-500 hover:text-navy-600">
              View all <ChevronRight className="h-4 w-4" />
            </NavLink>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {schools.map((school) => (
              <div key={school.id} className="overflow-hidden rounded-2xl bg-white shadow-card">
                <div className="h-48 bg-slate-100">
                  {!imageErrors[school.id] && school.photo ? (
                    <img
                      src={assetUrl(school.photo)}
                      alt={school.name}
                      className="h-full w-full object-cover"
                      onError={() => setImageErrors((prev) => ({ ...prev, [school.id]: true }))}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-navy-500" />
                    <span className="text-sm font-medium text-navy-600">{school.type}</span>
                  </div>
                  <h3 className="font-bold text-slate-800">{school.name}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" /> {school.address}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">Headmaster: {school.headmasterName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Facilities: {(school.facilities || []).slice(0, 3).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t('events.programGallery')}</h2>
              <p className="text-slate-500">Innovative events and school implementation highlights.</p>
            </div>
            <NavLink to="/programs" className="inline-flex items-center gap-1 font-medium text-navy-500 hover:text-navy-600">
              View all <ChevronRight className="h-4 w-4" />
            </NavLink>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {programs.map((program) => (
              <div key={program.id} className="rounded-2xl bg-slate-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
                  <Star className="h-5 w-5 text-teal-700" />
                </div>
                <h3 className="font-bold text-slate-800">{program.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{program.description}</p>
                <p className="mt-4 text-sm text-slate-600">
                  {program.submissions?.length || 0} school submissions
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Our Location</h2>
            <p className="text-slate-500">Chhatrapati Sambhajinagar (Aurangabad), Maharashtra</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500000!2d75.3!3d19.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdcbfeffffff%3A0x0!2sChhatrapati%20Sambhajinagar%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Chhatrapati Sambhajinagar Location Map"
            ></iframe>
          </div>
          <div className="mt-6 flex items-center gap-3 text-slate-600">
            <MapPin className="h-5 w-5 text-navy-500" />
            <p className="text-sm">Chhatrapati Sambhajinagar (formerly Aurangabad), Maharashtra, India</p>
          </div>
        </div>
      </section>

      <footer className="bg-slate-100 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-600">Scholastic Archive - Public Education Information Portal, Aurangabad, Maharashtra</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;
