import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Upload, CheckCircle2, FileText, Loader2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HMEvents = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitType, setSubmitType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [reportDescription, setReportDescription] = useState('');

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch events');
      setLoading(false);
    }
  };

  const openSubmitModal = (event, type) => {
    setSubmitModal(event);
    setSubmitType(type);
    setSelectedFiles([]);
    setReportDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitType === 'photos' && selectedFiles.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }
    if (submitType === 'report' && !reportDescription.trim()) {
      toast.error('Please enter a report description');
      return;
    }

    setSubmitLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('schoolId', JSON.parse(localStorage.getItem('user')).schoolId);
      formData.append('description', reportDescription);
      
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });

      await axios.post(`${API_URL}/events/${submitModal.id}/submit`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(`${submitType === 'photos' ? 'Photos' : 'Report'} submitted successfully`);
      setSubmitModal(null);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const hasSubmitted = (event) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return event.submissions?.some(s => s.schoolId === user.schoolId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('events.eventsTitle')}</h1>
        <p className="text-slate-500 mt-1">Participate in district events and submit reports</p>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy-500" />
          <p className="mt-2 text-slate-500">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => {
            const submitted = hasSubmitted(event);
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-navy-400 to-navy-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-white/30" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Upcoming'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{event.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  {submitted ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Submitted successfully</span>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => openSubmitModal(event, 'photos')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-lg font-medium hover:bg-navy-600 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {t('events.submitPhotos')}
                      </button>
                      <button 
                        onClick={() => openSubmitModal(event, 'report')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-navy-500 text-navy-500 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        {t('events.submitReport')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">
                {submitType === 'photos' ? 'Submit Photos' : 'Submit Report'} - {submitModal.name}
              </h3>
              <button onClick={() => setSubmitModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitType === 'photos' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Photos</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-navy-500 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'Click or drag to upload photos'}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description / Report</label>
                <textarea 
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 h-32 resize-none"
                  placeholder="Enter your report or description of participation..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setSubmitModal(null)} 
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HMEvents;
