import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Image as ImageIcon, MapPin, School } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE = API_URL.replace('/api', '');

const assetUrl = (value) => (value?.startsWith('/uploads') ? `${API_BASE}${value}` : value);

const PublicPrograms = () => {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(`${API_URL}/public/programs`);
        setPrograms(response.data.programs || []);
      } catch (error) {
        console.error('Failed to fetch programs', error);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">{t('events.programGallery')}</h1>
        <p className="mt-2 text-slate-500">Innovative programs, event photos, and implementation reports from schools.</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {programs.map((program) => (
          <div key={program.id} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              {!imageErrors[program.id] && (program.coverPhoto || program.photo) ? (
                <img
                  src={assetUrl(program.coverPhoto || program.photo)}
                  alt={program.name}
                  className="h-full w-full object-cover"
                  onError={() => setImageErrors((prev) => ({ ...prev, [program.id]: true }))}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-slate-300" />
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                {(program.type || 'program').toUpperCase()}
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800">{program.name}</h2>
              <p className="mt-2 text-slate-500">{program.description}</p>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {new Date(program.date).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {program.venue}
                </p>
                <p className="flex items-center gap-2">
                  <School className="h-4 w-4 text-slate-400" />
                  {program.submissions?.length || 0} schools submitted reports
                </p>
              </div>

              {program.submissions?.length > 0 && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700">Implementation Highlights</p>
                  <div className="space-y-2">
                    {program.submissions.slice(0, 3).map((submission) => (
                      <div key={`${program.id}-${submission.schoolId}`} className="rounded-xl bg-white p-3">
                        <p className="font-medium text-slate-800">{submission.schoolName}</p>
                        <p className="mt-1 text-sm text-slate-500">{submission.report}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicPrograms;
