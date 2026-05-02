import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Star, Trophy, Award, Medal } from 'lucide-react';
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

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-slate-300 text-slate-800';
    if (rank === 3) return 'bg-amber-600 text-amber-50';
    return 'bg-slate-100 text-slate-600';
  };

  if (loading) {
    return <LoadingSpinner text="Loading toppers..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-800 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-yellow-400" />
            <h1 className="text-4xl font-bold">{t('public.academicWallOfFame')}</h1>
          </div>
          <p className="text-lg text-navy-200 max-w-2xl mx-auto">
            Celebrating the outstanding achievements of our brightest students across the cluster
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top 3 Podium */}
        <div className="flex flex-wrap items-end justify-center gap-8 mb-16">
          {toppers.slice(0, 3).map((topper, index) => {
            const rank = index + 1;
            const heights = ['h-64', 'h-80', 'h-72'];
            const bgColors = ['from-slate-200 to-slate-300', 'from-yellow-300 to-yellow-400', 'from-amber-500 to-amber-600'];
            const textColors = ['text-slate-700', 'text-yellow-900', 'text-amber-50'];
            
            return (
              <div key={topper.id} className={`flex flex-col items-center ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
                {/* Rank Badge */}
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${bgColors[rank - 1]} ${textColors[rank - 1]} shadow-lg`}>
                  {rank === 1 ? <Trophy className="h-8 w-8" /> : <Medal className="h-8 w-8" />}
                </div>

                {/* Student Card */}
                <div className={`w-64 rounded-2xl bg-white shadow-xl overflow-hidden ${heights[rank - 1]} flex flex-col`}>
                  <div className="relative h-48 bg-gradient-to-br from-navy-500 to-navy-700">
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
                          <GraduationCap className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getRankColor(rank)}`}>
                        #{rank}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-bold text-slate-800">{topper.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">{topper.class}</p>
                    <div className="mt-4">
                      <p className="text-4xl font-bold text-navy-600">{topper.percentage}%</p>
                      <p className="text-xs text-slate-400 mt-1">Percentage</p>
                    </div>
                    {rank === 1 && (
                      <div className="mt-4 flex items-center gap-1 text-yellow-500">
                        <Star className="h-5 w-5 fill-yellow-400" />
                        <Star className="h-5 w-5 fill-yellow-400" />
                        <Star className="h-5 w-5 fill-yellow-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All Toppers List */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-navy-500 to-navy-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">All Toppers</h2>
            </div>
          </div>
          
          {toppers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">No toppers data available</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {toppers.map((topper, index) => (
                <div 
                  key={topper.id} 
                  className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full font-bold text-lg shadow-md ${getRankColor(index + 1)}`}>
                    {index + 1}
                  </div>
                  
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                    {!imageErrors[`${topper.id}-list`] && topper.photo ? (
                      <img
                        src={assetUrl(topper.photo)}
                        alt={topper.name}
                        className="h-full w-full object-cover"
                        onError={() => setImageErrors((prev) => ({ ...prev, [`${topper.id}-list`]: true }))}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-lg">{topper.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span>{topper.class}</span>
                      <span className="text-slate-300">•</span>
                      <span>{schools.find(s => s.id === topper.schoolId)?.name || 'School'}</span>
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-3xl font-bold text-navy-600">{topper.percentage}%</p>
                    {index < 3 && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-yellow-600 font-medium">Top {index + 1}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicToppers;
