import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      // Redirect based on role
      const redirectPath = result.user.role === 'kendrapramukh' 
        ? '/admin/dashboard' 
        : '/hm/dashboard';
      window.location.href = redirectPath;
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  // Demo credentials for easy access (development only)
  const demoCredentials = import.meta.env.DEV ? [
    { role: 'Kendrapramukh', email: 'kendrapramukh@eduauthority.gov.in', password: 'admin123' },
    { role: 'Headmaster', email: 'headmaster1@school.edu', password: 'headmaster123' }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-500 via-navy-600 to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-400/20 to-navy-600/40 p-12 flex-col justify-between relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-navy-600" />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-white">{t('app.name')}</h1>
                <p className="text-sm text-navy-200">{t('app.tagline')}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">Welcome Back</h2>
            <p className="text-navy-200 text-lg">Manage your schools, track attendance, and stay connected with your educational community.</p>
          </div>

          <div className="relative z-10">
            <p className="text-sm text-navy-300">© 2026 Scholastic Archive</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-navy-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-navy-500">{t('app.name')}</h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('auth.login')}</h2>
          <p className="text-slate-500 mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-start">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-navy-500 rounded border-slate-300 focus:ring-navy-500" />
                <span className="text-sm text-slate-600">{t('auth.rememberMe')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-500 hover:bg-navy-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          {/* Demo Credentials (Development Only) */}
          {demoCredentials.length > 0 && (
            <div className="mt-8 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Demo Credentials</p>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    onClick={() => setFormData({ email: cred.email, password: cred.password })}
                    className="w-full text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-navy-300 hover:bg-navy-50 transition-all text-sm"
                  >
                    <span className="font-medium text-slate-700">{cred.role}:</span>
                    <span className="text-slate-500 ml-2">{cred.email} / {cred.password}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
