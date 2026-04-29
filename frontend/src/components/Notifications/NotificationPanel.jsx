import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileText, Calendar, Users, FileCheck, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NotificationPanel = ({ onClose }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
      setLoading(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch notifications:', error);
      }
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      // Fallback: just update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } finally {
      setMarkingRead(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'gr': return <FileText className="w-5 h-5 text-teal-500" />;
      case 'meeting': return <Users className="w-5 h-5 text-blue-500" />;
      case 'event': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <FileCheck className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'gr': return 'bg-teal-50';
      case 'meeting': return 'bg-blue-50';
      case 'event': return 'bg-purple-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      
      {/* Panel */}
      <div className="absolute top-full right-0 mt-2 w-96 bg-navy-500 rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy-400">
          <h3 className="text-white font-semibold">{t('notifications.title')}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-400 text-navy-700 px-2 py-0.5 rounded-full font-medium">
              {unreadCount} {t('notifications.new')}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-navy-400 text-navy-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-navy-200">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              <p className="mt-2">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-navy-200">
              <p>{t('notifications.noNotifications')}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-navy-400/30 hover:bg-navy-400/20 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-navy-400/10' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {notification.title}
                    </p>
                    <p className="text-navy-200 text-xs mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-navy-300 text-xs mt-1.5">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-navy-400 bg-navy-600">
          <button 
            onClick={handleMarkAllRead}
            disabled={markingRead || notifications.length === 0}
            className="w-full py-2 bg-navy-400/50 hover:bg-navy-400 text-navy-100 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {markingRead ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t('notifications.markAllRead')}
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
