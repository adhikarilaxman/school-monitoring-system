import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import PublicLayout from './components/Layout/PublicLayout';

// Auth Pages
import Login from './pages/Auth/Login';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminAttendance from './pages/Admin/Attendance';
import AdminGRs from './pages/Admin/GRs';
import AdminEvents from './pages/Admin/Events';
import AdminMeetings from './pages/Admin/Meetings';
import AdminReporting from './pages/Admin/Reporting';
import AdminManagement from './pages/Admin/Management';

// Headmaster Pages
import HMDashboard from './pages/Headmaster/Dashboard';
import HMAttendance from './pages/Headmaster/Attendance';
import HMGRs from './pages/Headmaster/GRs';
import HMEvents from './pages/Headmaster/Events';
import HMMeetings from './pages/Headmaster/Meetings';
import HMReporting from './pages/Headmaster/Reporting';

// Public Pages
import PublicHome from './pages/Public/Home';
import PublicSchools from './pages/Public/Schools';
import PublicPrograms from './pages/Public/Programs';
import PublicToppers from './pages/Public/Toppers';

// Shared Pages
import Settings from './pages/Settings';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicHome />} />
            <Route path="/schools" element={<PublicSchools />} />
            <Route path="/programs" element={<PublicPrograms />} />
            <Route path="/toppers" element={<PublicToppers />} />
          </Route>

          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to={user.role === 'kendrapramukh' ? '/admin/dashboard' : '/hm/dashboard'} /> : <Login />} 
          />

          {/* Admin Routes */}
          <Route element={<MainLayout requiredRole="kendrapramukh" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/grs" element={<AdminGRs />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/meetings" element={<AdminMeetings />} />
            <Route path="/admin/reporting" element={<AdminReporting />} />
            <Route path="/admin/management" element={<AdminManagement />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* Headmaster Routes */}
          <Route element={<MainLayout requiredRole="headmaster" />}>
            <Route path="/hm/dashboard" element={<HMDashboard />} />
            <Route path="/hm/attendance" element={<HMAttendance />} />
            <Route path="/hm/grs" element={<HMGRs />} />
            <Route path="/hm/events" element={<HMEvents />} />
            <Route path="/hm/meetings" element={<HMMeetings />} />
            <Route path="/hm/reporting" element={<HMReporting />} />
            <Route path="/hm/settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
