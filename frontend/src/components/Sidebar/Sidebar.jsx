import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Sparkles,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Plus,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'kendrapramukh';
  const basePath = isAdmin ? '/admin' : '/hm';

  const navItems = [
    { path: `${basePath}/dashboard`, icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: `${basePath}/attendance`, icon: CalendarCheck, label: t('nav.attendance') },
    { path: `${basePath}/grs`, icon: FileText, label: t('nav.grs') },
    { path: `${basePath}/events`, icon: Sparkles, label: t('nav.events') },
    { path: `${basePath}/meetings`, icon: Users, label: t('nav.meetings') },
    { path: `${basePath}/reporting`, icon: BarChart3, label: t('nav.reporting') },
    ...(isAdmin ? [{ path: '/admin/management', icon: Shield, label: 'Management' }] : []),
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-navy-500 to-navy-700 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-navy-400/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-navy-600" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{t('app.name')}</h1>
            <p className="text-xs text-navy-200">{t('app.tagline')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-navy-600 shadow-lg'
                  : 'text-navy-100 hover:bg-navy-400/30 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-navy-600' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* New Report Button */}
      <div className="p-4">
        <button 
          onClick={() => window.location.href = `${basePath}/reporting`}
          className="w-full flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-300 text-navy-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>{t('nav.newReport')}</span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-navy-400/30 space-y-1">
        <NavLink
          to={`${basePath}/settings`}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            location.pathname === `${basePath}/settings`
              ? 'bg-white text-navy-600 shadow-lg'
              : 'text-navy-100 hover:bg-navy-400/30 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">{t('nav.settings')}</span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
