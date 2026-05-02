import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, CheckCircle2, X, Upload, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminEvents = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(location.state?.openCreateModal || false);
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    type: 'innovative',
    status: 'upcoming'
  });

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

  const filteredEvents = activeTab === 'all' ? events : events.filter(e => e.status === activeTab);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.date || !eventForm.venue) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreateLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', eventForm.name);
      formData.append('description', eventForm.description);
      // Backend expects startDate and endDate, not date/time separately
      formData.append('startDate', eventForm.date);
      formData.append('endDate', eventForm.date); // Same day event
      formData.append('venue', eventForm.venue);
      formData.append('type', eventForm.type);
      // Add target schools - default to all
      formData.append('schoolIds', 'all');
      
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });

      await axios.post(`${API_URL}/events`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Event created successfully');
      setShowCreateModal(false);
      setEventForm({ name: '', description: '', date: '', time: '', venue: '', type: 'innovative', status: 'upcoming' });
      setSelectedFiles([]);
      fetchEvents();
    } catch (error) {
      console.error('Event creation error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create event');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('events.eventsTitle')}</h1>
          <p className="text-slate-500 mt-1">Manage innovative programs and school events</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('events.createEvent')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['all', 'upcoming', 'ongoing', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-navy-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'all' ? 'All Events' : t(`events.${tab}`)}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy-500" />
          <p className="mt-2 text-slate-500">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const submissionCount = Object.keys(event.submissions || {}).length;
            const targetCount = event.schools?.length || 12;
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-navy-400 to-navy-600 relative">
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
                      <span>{new Date(event.startDate).toLocaleDateString()} {event.time ? `at ${event.time}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        <span className="font-semibold">{submissionCount}</span> / {targetCount} submissions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {submissionCount === targetCount ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Complete
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500">{targetCount - submissionCount} pending</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{t('events.createEvent')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('events.eventName')} *</label>
                <input 
                  type="text" 
                  value={eventForm.name}
                  onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('events.eventDescription')}</label>
                <textarea 
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 h-24 resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('events.date')} *</label>
                  <input 
                    type="date" 
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input 
                    type="time" 
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('events.venue')} *</label>
                <input 
                  type="text" 
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({...eventForm, venue: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                  required
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                  <option value="innovative">Innovative Program</option>
                  <option value="program">Program</option>
                  <option value="general">General Event</option>
                  </select>
                </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Photos</label>
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
                  <p className="text-xs text-slate-400 mt-1">Max 5 photos, 10MB each</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)} 
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
