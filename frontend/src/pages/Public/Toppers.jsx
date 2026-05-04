import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Star, Trophy, Award, Medal, Crown, Sparkles } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE = API_URL.replace('/api', '');

const assetUrl = (value) => (value?.startsWith('/uploads') ? `${API_BASE}${value}` : value);

const PublicToppers = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [toppers, setToppers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toppersRes, schoolsRes] = await Promise.all([
          axios.get(`${API_URL}/public/toppers`),
          axios.get(`${API_URL}/public/schools`)
        ]);
        setToppers(toppersRes.data.toppers || []);
        setSchools(schoolsRes.data.schools || []);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to fetch data', error);
        }
        toast.error('Failed to load toppers data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRankStyles = (rank) => {
    const styles = {
      1: {
        bg: 'from-yellow-400 via-yellow-300 to-yellow-500',
        text: 'text-yellow-900',
        border: 'border-yellow-400',
        shadow: 'shadow-yellow-400/50',
        badge: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
      },
      2: {
        bg: 'from-slate-200 via-slate-300 to-slate-400',
        text: 'text-slate-800',
        border: 'border-slate-300',
        shadow: 'shadow-slate-400/50',
        badge: 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-800'
      },
      3: {
        bg: 'from-amber-500 via-amber-600 to-amber-700',
        text: 'text-amber-50',
        border: 'border-amber-500',
        shadow: 'shadow-amber-500/50',
        badge: 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-50'
      }
    };
    return styles[rank] || {
      bg: 'from-slate-100 to-slate-200',
      text: 'text-slate-600',
      border: 'border-slate-200',
      shadow: 'shadow-slate-200/50',
      badge: 'bg-slate-100 text-slate-600'
    };
  };

  if (loading) {
    return <LoadingSpinner text="Loading toppers..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-700 via-navy-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Trophy className="h-14 w-14 text-yellow-400" />
              <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-2 -right-2" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">{t('public.academicWallOfFame')}</h1>
          </div>
          <p className="text-xl text-navy-100 max-w-3xl mx-auto leading-relaxed">
            Celebrating excellence and honoring the outstanding achievements of our brightest students across the cluster
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-navy-200">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">Academic Excellence</span>
            </div>
            <div className="flex items-center gap-2 text-navy-200">
              <Award className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Student Recognition</span>
            </div>
            <div className="flex items-center gap-2 text-navy-200">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Achievement Awards</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top 3 Podium */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Top Achievers</h2>
            <p className="text-slate-500">The highest performing students of the year</p>
          </div>
          
          <div className="flex flex-wrap items-end justify-center gap-6 lg:gap-10">
            {toppers.slice(0, 3).map((topper, index) => {
              const rank = index + 1;
              const styles = getRankStyles(rank);
              const heights = ['h-72', 'h-96', 'h-80'];
              const order = rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3';
              
              return (
                <div key={topper.id} className={`flex flex-col items-center ${order} group`}>
                  {/* Floating Crown for 1st place */}
                  {rank === 1 && (
                    <div className="mb-4 animate-bounce">
                      <Crown className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
                    </div>
                  )}

                  {/* Rank Badge */}
                  <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${styles.badge} shadow-2xl border-4 border-white transform group-hover:scale-110 transition-transform duration-300`}>
                    {rank === 1 ? (
                      <Trophy className="h-10 w-10" />
                    ) : (
                      <Medal className="h-10 w-10" />
                    )}
                  </div>

                  {/* Student Card */}
                  <div className={`w-72 lg:w-80 rounded-3xl bg-white shadow-2xl overflow-hidden ${heights[rank - 1]} flex flex-col transform group-hover:-translate-y-2 transition-all duration-300 border-2 ${styles.border} ${styles.shadow}`}>
                    <div className="relative h-56 bg-gradient-to-br from-navy-600 to-indigo-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {!imageErrors[topper.id] && topper.photo ? (
                          <img
                            src={assetUrl(topper.photo)}
                            alt={topper.name}
                            className="h-full w-full object-cover"
                            onError={() => setImageErrors((prev) => ({ ...prev, [topper.id]: true }))}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <GraduationCap className="h-20 w-20 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${styles.badge}`}>
                          Rank #{rank}
                        </div>
                      </div>
                      {rank === 1 && (
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center gap-1 bg-yellow-400/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 fill-yellow-900 text-yellow-900" />
                            <span className="text-xs font-bold text-yellow-900">Champion</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50">
                      <h2 className="text-2xl font-bold text-slate-800 mb-1">{topper.name}</h2>
                      <p className="text-sm text-slate-500 mb-4 font-medium">{topper.class}</p>
                      <div className="mb-4">
                        <p className="text-5xl font-bold bg-gradient-to-r from-navy-600 to-indigo-600 bg-clip-text text-transparent">
                          {topper.percentage}%
                        </p>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Percentage</p>
                      </div>
                      {rank === 1 && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-6 w-6 fill-yellow-400" />
                          <Star className="h-6 w-6 fill-yellow-400" />
                          <Star className="h-6 w-6 fill-yellow-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Toppers List */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-navy-600 via-navy-700 to-indigo-700 px-8 py-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Award className="h-8 w-8 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">All Toppers</h2>
                  <p className="text-navy-200 text-sm mt-1">Complete list of high achievers</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-sm font-medium">{toppers.length} Students</span>
              </div>
            </div>
          </div>
          
          {toppers.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-full mb-6">
                <GraduationCap className="h-12 w-12 text-slate-300" />
              </div>
              <p className="text-xl font-medium text-slate-600">No toppers data available</p>
              <p className="text-slate-400 mt-2">Check back later for updates</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {toppers.map((topper, index) => {
                const styles = getRankStyles(index + 1);
                return (
                  <div 
                    key={topper.id} 
                    className="flex items-center gap-6 p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 group"
                  >
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl font-bold text-xl shadow-lg border-2 ${styles.badge} ${styles.border} transform group-hover:scale-110 transition-transform duration-300`}>
                      {index + 1}
                    </div>
                    
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-inner border-2 border-slate-200 group-hover:border-navy-300 transition-colors">
                      {!imageErrors[`${topper.id}-list`] && topper.photo ? (
                        <img
                          src={assetUrl(topper.photo)}
                          alt={topper.name}
                          className="h-full w-full object-cover"
                          onError={() => setImageErrors((prev) => ({ ...prev, [`${topper.id}-list`]: true }))}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <GraduationCap className="h-10 w-10 text-slate-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-xl group-hover:text-navy-600 transition-colors">{topper.name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <span className="font-medium">{topper.class}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">{schools.find(s => s.id === topper.schoolId)?.name || 'School'}</span>
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-4xl font-bold bg-gradient-to-r from-navy-600 to-indigo-600 bg-clip-text text-transparent">
                        {topper.percentage}%
                      </p>
                      {index < 3 && (
                        <div className="flex items-center gap-1 justify-end mt-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-yellow-600">Top {index + 1}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicToppers;
