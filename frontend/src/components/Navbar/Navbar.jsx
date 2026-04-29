import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Globe,
  Check,
  User,
  LogOut
} from 'lucide-react';
import NotificationPanel from '../Notifications/NotificationPanel';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      // Route based on search content
      if (query.includes('school') || query.includes('zp') || query.includes('government')) {
        navigate('/schools');
      } else if (query.includes('event') || query.includes('program')) {
        navigate('/programs');
      } else if (query.includes('topper') || query.includes('student') || query.includes('rank')) {
        navigate('/toppers');
      } else if (query.includes('meeting')) {
        const basePath = user?.role === 'kendrapramukh' ? '/admin' : '/hm';
        navigate(`${basePath}/meetings`);
      } else if (query.includes('gr') || query.includes('resolution') || query.includes('circular')) {
        const basePath = user?.role === 'kendrapramukh' ? '/admin' : '/hm';
        navigate(`${basePath}/grs`);
      } else if (query.includes('report') || query.includes('form')) {
        const basePath = user?.role === 'kendrapramukh' ? '/admin' : '/hm';
        navigate(`${basePath}/reporting`);
      } else if (query.includes('attendance')) {
        const basePath = user?.role === 'kendrapramukh' ? '/admin' : '/hm';
        navigate(`${basePath}/attendance`);
      } else {
        // Default to schools for unmatched searches
        navigate('/schools');
      }
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleAccount = () => {
    const basePath = user?.role === 'kendrapramukh' ? '/admin' : '/hm';
    navigate(`${basePath}/settings`);
    setShowUserMenu(false);
  };

  return (
    <header className="h-16 bg-white shadow-nav flex items-center justify-between px-6 z-10">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('nav.search') + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 transition-all"
          />
        </form>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Language Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              {currentLanguage === 'en' ? 'EN' : 'MR'}
            </span>
          </button>

          {showLanguageMenu && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <button
                onClick={() => {
                  if (currentLanguage !== 'en') toggleLanguage();
                  setShowLanguageMenu(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">EN</span>
                  {t('language.english')}
                </span>
                {currentLanguage === 'en' && <Check className="w-4 h-4 text-navy-500" />}
              </button>
              <button
                onClick={() => {
                  if (currentLanguage !== 'mr') toggleLanguage();
                  setShowLanguageMenu(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">MR</span>
                  {t('language.marathi')}
                </span>
                {currentLanguage === 'mr' && <Check className="w-4 h-4 text-navy-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Help */}
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <HelpCircle className="w-5 h-5 text-slate-600" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500">
                {user?.role === 'kendrapramukh' ? t('auth.role.kendrapramukh') : t('auth.role.headmaster')}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <button
                onClick={handleAccount}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 transition-colors"
              >
                <User className="w-4 h-4 text-slate-500" />
                Account
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-sm text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
