import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Plus, Calendar, Clock, MapPin, Video, Users, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminMeetings = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(location.state?.openCreateModal || false);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    type: 'offline',
    date: '',
    time: '',
    venue: '',
    link: '',
    agenda: ''
  });

  // Fetch meetings on mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(response.data.meetings || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch meetings');
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time || !meetingForm.venue) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreateLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_URL}/meetings`, meetingForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Meeting scheduled successfully');
      setShowCreateModal(false);
      setMeetingForm({ title: '', type: 'offline', date: '', time: '', venue: '', link: '', agenda: '' });
      fetchMeetings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('meetings.title')}</h1>
          <p className="text-slate-500 mt-1">Schedule and manage meetings with headmasters</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('meetings.scheduleMeeting')}
        </button>
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy-500" />
          <p className="mt-2 text-slate-500">Loading meetings...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p>No meetings scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const responseCount = meeting.schoolResponses ? Object.keys(meeting.schoolResponses).length : 0;
            const acceptedCount = meeting.schoolResponses 
              ? Object.values(meeting.schoolResponses).filter(r => r.status === 'accepted').length 
              : 0;
            return (
              <div key={meeting.id} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      meeting.type === 'online' ? 'bg-blue-100' : 'bg-teal-100'
                    }`}>
                      {meeting.type === 'online' ? (
                        <Video className="w-6 h-6 text-blue-600" />
                      ) : (
                        <MapPin className="w-6 h-6 text-teal-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{meeting.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          meeting.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                        }`}>
                          {meeting.type === 'online' ? t('meetings.online') : t('meetings.offline')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{meeting.agenda}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(meeting.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {meeting.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {meeting.venue}
                        </span>
                      </div>
                      {meeting.link && (
                        <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">
                        <span className="font-semibold">{acceptedCount}</span> / {responseCount} accepted
                      </span>
                    </div>
                    {responseCount - acceptedCount > 0 && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                        {responseCount - acceptedCount} pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{t('meetings.scheduleMeeting')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Meeting Title *</label>
                <input 
                  type="text" 
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select 
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({...meetingForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="offline">{t('meetings.offline')}</option>
                    <option value="online">{t('meetings.online')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('events.date')} *</label>
                  <input 
                    type="date" 
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time *</label>
                  <input 
                    type="time" 
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('events.venue')} *</label>
                  <input 
                    type="text" 
                    value={meetingForm.venue}
                    onChange={(e) => setMeetingForm({...meetingForm, venue: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                    required
                  />
                </div>
              </div>
              {meetingForm.type === 'online' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meeting Link</label>
                  <input 
                    type="url" 
                    value={meetingForm.link}
                    onChange={(e) => setMeetingForm({...meetingForm, link: e.target.value})}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('meetings.agenda')}</label>
                <textarea 
                  value={meetingForm.agenda}
                  onChange={(e) => setMeetingForm({...meetingForm, agenda: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 h-24 resize-none"
                ></textarea>
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
                  {t('meetings.scheduleMeeting')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMeetings;
