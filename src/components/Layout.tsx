import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, Clock, UserCog, LogOut, Settings, Users, Database, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export function Layout() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const isActive = path => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  return <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="flex flex-col h-full">
          <div className="p-5 border-b">
            <h1 className="text-xl font-bold text-gray-800">
              Leave Management
            </h1>
            <div className="mt-2 text-sm text-gray-600">
              <p>Logged in as:</p>
              <p className="font-medium">{user?.name}</p>
              <p className="capitalize">{user?.role}</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/dashboard" className={`flex items-center p-3 rounded-lg ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link to="/apply" className={`flex items-center p-3 rounded-lg ${isActive('/apply') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <CalendarPlus className="w-5 h-5 mr-3" />
              Apply for Leave
            </Link>
            <Link to="/history" className={`flex items-center p-3 rounded-lg ${isActive('/history') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <Clock className="w-5 h-5 mr-3" />
              Leave History
            </Link>
            <Link to="/til" className={`flex items-center p-3 rounded-lg ${isActive('/til') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <Timer className="w-5 h-5 mr-3" />
              Time in Lieu
            </Link>
            {user?.role === 'admin' && <>
                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </div>
                <Link to="/admin" className={`flex items-center p-3 rounded-lg ${isActive('/admin') && location.pathname === '/admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <UserCog className="w-5 h-5 mr-3" />
                  Admin Center
                </Link>
                <Link to="/admin/users" className={`flex items-center p-3 rounded-lg ${isActive('/admin/users') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Users className="w-5 h-5 mr-3" />
                  User Management
                </Link>
                <Link to="/admin/leave-pools" className={`flex items-center p-3 rounded-lg ${isActive('/admin/leave-pools') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Database className="w-5 h-5 mr-3" />
                  Leave Pools
                </Link>
                <Link to="/admin/leave-types" className={`flex items-center p-3 rounded-lg ${isActive('/admin/leave-types') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Settings className="w-5 h-5 mr-3" />
                  Leave Types
                </Link>
              </>}
          </nav>
          <div className="p-4 border-t">
            <button onClick={handleLogout} className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100">
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 min-h-full">
          <Outlet />
        </div>
      </div>
    </div>;
}