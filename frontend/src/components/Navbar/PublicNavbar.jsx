import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { Building2, Search, Globe, Check } from 'lucide-react';
import { useState } from 'react';

const PublicNavbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schools?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLoginClick = () => {
    window.open('/login', '_blank', 'noopener,noreferrer');
  };

  return (
    <nav className="bg-white shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-navy-500 text-lg">{t('app.name')}</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{t('app.tagline')}</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-navy-50 text-navy-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/schools"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-navy-50 text-navy-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              Schools
            </NavLink>
            <NavLink
              to="/toppers"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-navy-50 text-navy-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              Toppers
            </NavLink>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-slate-100 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm ml-2 w-32"
              />
            </form>

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

            {/* Login Button */}
            <button
              onClick={handleLoginClick}
              className="bg-navy-500 hover:bg-navy-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t('auth.login')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
