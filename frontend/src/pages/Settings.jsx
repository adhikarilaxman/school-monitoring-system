import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, Bell, Globe, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Settings = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { setLanguage } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    language: 'en'
  });
  
  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setPreferences(prev => ({
        ...prev,
        language: localStorage.getItem('i18nextLng') || 'en'
      }));
    }
  }, [user]);
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/auth/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // Handle preference change
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    if (key === 'language') {
      setLanguage(value);
    }
    
    // Save to localStorage for persistence
    localStorage.setItem(`preference_${key}`, JSON.stringify(value));
    toast.success(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated`);
  };
  
  // Handle save all preferences
  const handleSavePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    toast.success('All preferences saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('nav.settings')}</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-navy-600" />
              </div>
              <h3 className="font-bold text-slate-800">Profile Information</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input 
                  type="tel" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Profile
                </button>
              </div>
            </div>
          </form>

          <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-slate-800">Change Password</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" 
                    required
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Change Password
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-800">Notifications</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm text-slate-700">Email notifications</span>
                <input 
                  type="checkbox" 
                  checked={preferences.emailNotifications}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4 text-navy-500 rounded" 
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm text-slate-700">Push notifications</span>
                <input 
                  type="checkbox" 
                  checked={preferences.pushNotifications}
                  onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                  className="w-4 h-4 text-navy-500 rounded" 
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm text-slate-700">SMS alerts</span>
                <input 
                  type="checkbox" 
                  checked={preferences.smsAlerts}
                  onChange={(e) => handlePreferenceChange('smsAlerts', e.target.checked)}
                  className="w-4 h-4 text-navy-500 rounded" 
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-slate-800">Language</h3>
            </div>
            <select 
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="en">English</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          <button 
            onClick={handleSavePreferences}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-navy-500 text-white rounded-xl font-medium hover:bg-navy-600 transition-colors"
          >
            <Save className="w-5 h-5" />
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
