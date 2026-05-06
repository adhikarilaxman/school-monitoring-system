import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ChevronLeft, ChevronRight, GraduationCap, Image as ImageIcon, MapPin, Star, TrendingUp, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE = API_URL.replace('/api', '');

const assetUrl = (value) => {
  if (!value) return null;
  if (value?.startsWith('/uploads')) return `${API_BASE}${value}`;
  if (value?.startsWith('/schools')) return value;
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
  const [currentSlide, setCurrentSlide] = useState(0);

  const schoolsList = [
    { name: "St. Xavier's High School", photo: '/schools/school_1.png' },
    { name: 'Carmel Convent High School', photo: '/schools/school_2.png' },
    { name: 'Deogiri College School', photo: '/schools/school_3.png' },
    { name: 'MIT Vishwashanti Gurukul School', photo: '/schools/school_4.png' },
    { name: 'Zilla Parishad Primary School, CIDCO', photo: '/schools/school_5.png' },
    { name: 'Shivaji High School', photo: '/schools/school_6.png' },
    { name: 'Dr. Babasaheb Ambedkar High School', photo: '/schools/school_7.png' },
    { name: 'Podar International School', photo: '/schools/school_8.png' },
    { name: 'ZP Primary School, Garkheda', photo: '/schools/school_9.png' },
    { name: 'Dnyanprabodhini School', photo: '/schools/school_10.png' },
    { name: 'Ryan International School', photo: '/schools/school_11.png' },
    { name: 'Government Polytechnic School', photo: '/schools/school_12.png' },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % schoolsList.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + schoolsList.length) % schoolsList.length);

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

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % schoolsList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [schoolsList.length]);

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
            <h2 className="text-2xl font-bold text-slate-800">Our Schools & Location</h2>
            <p className="text-slate-500">Explore our 12 schools across Chhatrapati Sambhajinagar, Maharashtra</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* School Photo Carousel */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
              <div className="relative h-80 sm:h-96">
                {schoolsList.map((school, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <img
                      src={school.photo}
                      alt={school.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white font-semibold text-lg">{school.name}</p>
                      <p className="text-white/80 text-sm">Chhatrapati Sambhajinagar</p>
                    </div>
                  </div>
                ))}

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-700 rounded-full p-2 shadow-lg transition-all"
                  aria-label="Previous school"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-700 rounded-full p-2 shadow-lg transition-all"
                  aria-label="Next school"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 py-4 bg-white">
                {schoolsList.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? 'w-6 bg-navy-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to school ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 h-80 sm:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d150102.8375199343!2d75.2321328!3d19.870169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m1!1s0x3bdb981f7d0f8d37:0x3c6a3b0e8f5c5a0!2sChhatrapati%20Sambhajinagar%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1600000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Chhatrapati Sambhajinagar Location Map"
              ></iframe>
            </div>
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
