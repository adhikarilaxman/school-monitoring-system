import { useEffect, useMemo, useState } from 'react';
import { Building2, Mail, MapPin, Phone, Search, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

const assetUrl = (value) => (value?.startsWith('/uploads') ? `${API_BASE}${value}` : value);

const PublicSchools = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [schools, setSchools] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

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
      }
    };

    fetchSchools();
  }, []);

  const searchQuery = searchParams.get('search') || '';

  const filteredSchools = useMemo(() => {
    if (!searchQuery) {
      return schools;
    }

    const query = searchQuery.toLowerCase();
    return schools.filter((school) =>
      [school.name, school.address, school.type, school.headmasterName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [schools, searchQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch.trim() });
      return;
    }
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">All Schools</h1>
        <p className="mt-2 text-slate-500">{filteredSchools.length} schools under the cluster</p>
      </div>

      <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
        <div className="flex items-center rounded-2xl bg-white px-4 py-3 shadow-card">
          <Search className="mr-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by school, area, type, or headmaster"
            className="flex-1 border-none bg-transparent outline-none"
          />
          <button type="submit" className="rounded-lg bg-navy-500 px-4 py-2 text-sm font-medium text-white hover:bg-navy-600">
            Search
          </button>
        </div>
      </form>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {filteredSchools.map((school) => (
          <div key={school.id} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="h-56 bg-slate-100 md:h-full">
                {!imageErrors[school.id] && school.photo ? (
                  <img
                    src={assetUrl(school.photo)}
                    alt={school.name}
                    className="h-full w-full object-cover"
                    onError={() => setImageErrors((prev) => ({ ...prev, [school.id]: true }))}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Building2 className="h-12 w-12 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{school.name}</h2>
                    <p className="mt-1 text-sm font-medium text-navy-600">{school.type}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    UDISE {school.udise}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" /> {school.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" /> {school.contact}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" /> {school.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" /> Headmaster: {school.headmasterName}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-navy-600">{school.staff?.teachers || 0}</p>
                    <p className="text-xs text-slate-500">Teachers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-600">{school.staff?.admin || 0}</p>
                    <p className="text-xs text-slate-500">Admin</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-600">{school.staff?.support || 0}</p>
                    <p className="text-xs text-slate-500">Support</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-sm font-semibold text-slate-700">Headmaster Gallery</p>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-full bg-white">
                        {school.headmasterPhoto ? (
                          !imageErrors[`${school.id}-headmaster`] ? (
                            <img
                              src={assetUrl(school.headmasterPhoto)}
                              alt={school.headmasterName}
                              className="h-full w-full object-cover"
                              onError={() => markImageError(`${school.id}-headmaster`)}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-navy-500 text-sm font-bold text-white">
                              {school.headmasterName?.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                            </div>
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Users className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{school.headmasterName}</p>
                        <p className="text-sm text-slate-500">Headmaster</p>
                        <p className="text-sm text-slate-500">{school.headmasterContact}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Staff Gallery</p>
                      <div className="flex flex-wrap gap-2">
                        {(school.staffPhotos || []).map((photo, index) => (
                          imageErrors[`${school.id}-staff-${index}`] ? (
                            <div
                              key={`${school.id}-staff-${index}`}
                              className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 ring-2 ring-white"
                            >
                              S{index + 1}
                            </div>
                          ) : (
                            <img
                              key={`${school.id}-staff-${index}`}
                              src={assetUrl(photo)}
                              alt={`${school.name} staff ${index + 1}`}
                              className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
                              onError={() => markImageError(`${school.id}-staff-${index}`)}
                            />
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-slate-700">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {(school.facilities || []).map((facility) => (
                      <span key={facility} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicSchools;
