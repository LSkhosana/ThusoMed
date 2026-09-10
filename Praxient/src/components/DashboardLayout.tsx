import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  LayoutDashboard,
  User,
  Calendar,
  ClipboardList,
  Eye,
  Inbox,
  Code,
  Smartphone,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/profile', icon: User, label: 'Practice Profile' },
  { to: '/dashboard/schedule', icon: Calendar, label: 'Appointment Schedule' },
  { to: '/dashboard/booking-form', icon: ClipboardList, label: 'Booking Form Builder' },
  { to: '/dashboard/booking-preview', icon: Eye, label: 'Booking Preview' },
  { to: '/dashboard/appointments', icon: Inbox, label: 'Appointments' },
  { to: '/dashboard/embeds', icon: Code, label: 'Embeds' },
  { to: '/dashboard/patient-app', icon: Smartphone, label: 'Patient App Preview' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export const DashboardLayout: React.FC = () => {
  const { account, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ThusoMed</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User info & logout */}
          <div className="px-4 py-4 border-t border-slate-800">
            <div className="mb-4">
              <p className="text-sm font-medium text-white truncate">
                {account?.doctorName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {account?.practiceName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-800">
                  Demo Mode
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Demo Banner */}
          <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
            <p className="text-sm text-sky-800">
              <strong>Demo Mode:</strong> This is a frontend prototype. Data is
              stored locally in your browser.
            </p>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};
