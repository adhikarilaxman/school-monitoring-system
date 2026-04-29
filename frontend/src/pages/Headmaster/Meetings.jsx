import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Video, MapPin, Calendar, Clock, CheckCircle2, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HMMeetings = () => {
  const { t } = useTranslation();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState({});

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

  const handleRespond = async (meetingId, status) => {
    setResponding(prev => ({ ...prev, [meetingId]: status }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/meetings/${meetingId}/respond`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setMeetings(prev => prev.map(m => 
        m.id === meetingId 
          ? { ...m, myResponse: { status, respondedAt: new Date().toISOString() } }
          : m
      ));
      
      toast.success(`Meeting ${status} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to respond to meeting');
    } finally {
      setResponding(prev => ({ ...prev, [meetingId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('meetings.title')}</h1>
        <p className="text-slate-500 mt-1">Respond to meeting invitations</p>
      </div>

      <div className="space-y-4">
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
          meetings.map((meeting) => {
            const response = meeting.myResponse?.status || 'pending';
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
                        <a 
                          href={meeting.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline mt-2 inline-block"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    {response === 'accepted' ? (
                      <span className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('meetings.accepted')}
                      </span>
                    ) : response === 'declined' ? (
                      <span className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                        <XCircle className="w-4 h-4" />
                        Declined
                      </span>
                    ) : response === 'tentative' ? (
                      <span className="flex items-center gap-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
                        <HelpCircle className="w-4 h-4" />
                        Maybe
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRespond(meeting.id, 'accepted')}
                          disabled={responding[meeting.id]}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {responding[meeting.id] === 'accepted' ? <Loader2 className="w-4 h-4 animate-spin" /> : t('meetings.accept')}
                        </button>
                        <button 
                          onClick={() => handleRespond(meeting.id, 'declined')}
                          disabled={responding[meeting.id]}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          {responding[meeting.id] === 'declined' ? <Loader2 className="w-4 h-4 animate-spin" /> : t('meetings.decline')}
                        </button>
                        <button 
                          onClick={() => handleRespond(meeting.id, 'tentative')}
                          disabled={responding[meeting.id]}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          {responding[meeting.id] === 'tentative' ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HMMeetings;
