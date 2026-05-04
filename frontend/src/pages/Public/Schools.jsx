import { useEffect, useMemo, useState } from 'react';
import { Building2, Mail, MapPin, Phone, Search, Users, GraduationCap, Sparkles, Filter, X, School } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
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

const PublicSchools = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [schools, setSchools] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  const markImageError = (key) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`${API_URL}/public/schools`);
        setSchools(response.data.schools || []);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to fetch schools', error);
        }
        toast.error('Failed to load schools data');
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const searchQuery = searchParams.get('search') || '';

  const schoolTypes = useMemo(() => {
    const types = [...new Set(schools.map(s => s.type))];
    return ['all', ...types];
  }, [schools]);

  const filteredSchools = useMemo(() => {
    let result = schools;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((school) =>
        [school.name, school.address, school.type, school.headmasterName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      );
    }
    
    if (selectedType !== 'all') {
      result = result.filter(school => school.type === selectedType);
    }
    
    return result;
  }, [schools, searchQuery, selectedType]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch.trim() });
      return;
    }
    setSearchParams({});
  };

  const clearSearch = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  const getInitials = (name) => {
    return name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'S';
  };

  const getTypeColor = (type) => {
    const colors = {
      'Primary': 'bg-green-100 text-green-700 border-green-200',
      'Secondary': 'bg-blue-100 text-blue-700 border-blue-200',
      'Higher Secondary': 'bg-purple-100 text-purple-700 border-purple-200',
      'CBSE': 'bg-orange-100 text-orange-700 border-orange-200',
      'International': 'bg-pink-100 text-pink-700 border-pink-200',
      'Technical': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    };
    return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-navy-500"></div>
            <p className="mt-4 text-lg text-slate-600">Loading schools...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-700 via-navy-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <School className="h-8 w-8 text-yellow-400" />
            </div>
            <Sparkles className="h-6 w-6 text-yellow-300" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Schools Directory</h1>
          <p className="mt-4 text-xl text-navy-100 max-w-2xl mx-auto">
            Discover {schools.length} educational institutions across Chhatrapati Sambhajinagar
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Building2 className="h-5 w-5 text-teal-300" />
              <span className="text-sm">{schools.length} Schools</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <GraduationCap className="h-5 w-5 text-yellow-300" />
              <span className="text-sm">All Types</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Users className="h-5 w-5 text-pink-300" />
              <span className="text-sm">Experienced Faculty</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-10 border border-slate-100">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by school name, area, type, or headmaster..."
                className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-navy-500 focus:bg-white focus:outline-none transition-all text-slate-700 placeholder:text-slate-400"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <button 
                type="submit" 
                className="rounded-xl bg-navy-500 px-8 py-3 font-semibold text-white hover:bg-navy-600 transition-colors shadow-lg shadow-navy-500/30"
              >
                Search Schools
              </button>
            </div>
          </form>

          {/* Type Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-500">Filter by type:</span>
            {schoolTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedType === type 
                    ? 'bg-navy-500 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-slate-600">
            Showing <span className="font-bold text-slate-800">{filteredSchools.length}</span> of{' '}
            <span className="font-bold text-slate-800">{schools.length}</span> schools
          </p>
          {(searchQuery || selectedType !== 'all') && (
            <button
              onClick={() => { clearSearch(); setSelectedType('all'); }}
              className="text-sm text-navy-500 hover:text-navy-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Schools Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {filteredSchools.map((school) => (
            <div 
              key={school.id} 
              className="group bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden">
                {!imageErrors[school.id] && school.photo ? (
                  <img
                    src={assetUrl(school.photo)}
                    alt={school.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => {
                      console.log('Image failed to load:', school.photo);
                      setImageErrors((prev) => ({ ...prev, [school.id]: true }));
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-navy-500 to-indigo-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Building2 className="h-16 w-16 mx-auto mb-3 opacity-80" />
                      <p className="text-lg font-semibold">{school.name}</p>
                      <p className="text-sm opacity-75">{school.type}</p>
                    </div>
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 ${getTypeColor(school.type)} bg-white/95 backdrop-blur-sm`}>
                    {school.type}
                  </span>
                </div>
                
                {/* UDISE Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur-sm">
                    UDISE: {school.udise}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-navy-600 transition-colors">
                  {school.name}
                </h2>
                
                <div className="space-y-3 mt-4">
                  <p className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <MapPin className="h-4 w-4 text-navy-500" />
                    </div>
                    <span className="text-sm">{school.address}</span>
                  </p>
                  <p className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Phone className="h-4 w-4 text-navy-500" />
                    </div>
                    <span className="text-sm">{school.contact}</span>
                  </p>
                  <p className="flex items-center gap-3 text-slate-600">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Mail className="h-4 w-4 text-navy-500" />
                    </div>
                    <span className="text-sm truncate">{school.email}</span>
                  </p>
                </div>

                {/* Staff Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{school.staff?.teachers || 0}</p>
                    <p className="text-xs text-blue-600/70 font-medium uppercase tracking-wide">Teachers</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{school.staff?.admin || 0}</p>
                    <p className="text-xs text-purple-600/70 font-medium uppercase tracking-wide">Admin</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center border border-green-200">
                    <p className="text-2xl font-bold text-green-600">{school.staff?.support || 0}</p>
                    <p className="text-xs text-green-600/70 font-medium uppercase tracking-wide">Support</p>
                  </div>
                </div>

                {/* Headmaster Section */}
                <div className="mt-6 bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Headmaster</p>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-gradient-to-br from-navy-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {!imageErrors[`${school.id}-headmaster`] && school.headmasterPhoto ? (
                        <img
                          src={assetUrl(school.headmasterPhoto)}
                          alt={school.headmasterName}
                          className="h-full w-full object-cover"
                          onError={() => markImageError(`${school.id}-headmaster`)}
                        />
                      ) : (
                        getInitials(school.headmasterName)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{school.headmasterName}</p>
                      <p className="text-sm text-slate-500">{school.headmasterContact}</p>
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {(school.facilities || []).slice(0, 5).map((facility) => (
                      <span 
                        key={facility} 
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border border-sky-200"
                      >
                        {facility}
                      </span>
                    ))}
                    {(school.facilities || []).length > 5 && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        +{(school.facilities || []).length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Established */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 text-center">
                    Established in <span className="font-semibold text-slate-700">{school.established}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSchools.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-full mb-6">
              <Search className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No schools found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => { clearSearch(); setSelectedType('all'); }}
              className="rounded-xl bg-navy-500 px-6 py-3 font-semibold text-white hover:bg-navy-600 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSchools;
