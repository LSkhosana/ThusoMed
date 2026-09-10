import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Stethoscope,
  LayoutDashboard,
  User,
  Calendar,
  ClipboardList,
  Inbox,
  Smartphone,
  Settings,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { usePractice } from '../context/PracticeContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/profile', icon: User, label: 'Practice Profile' },
  { to: '/dashboard/availability', icon: Calendar, label: 'Availability' },
  { to: '/dashboard/appointment-types', icon: ClipboardList, label: 'Appointment Types' },
  { to: '/dashboard/appointments', icon: Inbox, label: 'Appointments' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export const DashboardLayout: React.FC = () => {
  const { practice, loading, error } = usePractice();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white block leading-tight">Praxient</span>
                  <span className="text-[10px] text-slate-400">Praxient by ThusoMed</span>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

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
            <NavLink
              to="/dashboard/patient-app"
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Smartphone className="w-5 h-5" />
              Patient App Preview
            </NavLink>
          </nav>

          <div className="px-4 py-4 border-t border-slate-800">
            <p className="text-sm font-medium text-white truncate">
              {practice?.practitionerName || 'Demo practice'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {practice?.practiceName || 'Praxient demo'}
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
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
                <span className="text-xs font-medium text-amber-800">Demo Mode</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
            <p className="text-sm text-sky-800">
              <strong>Praxient demo:</strong> Practice Profile, Availability, Appointment Types,
              and Appointments are stored in Supabase. This is stakeholder demonstration code, not
              a production system.
            </p>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              {error}
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};
