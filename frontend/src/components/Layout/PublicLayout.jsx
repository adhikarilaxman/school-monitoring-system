import { Outlet } from 'react-router-dom';
import PublicNavbar from '../Navbar/PublicNavbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
