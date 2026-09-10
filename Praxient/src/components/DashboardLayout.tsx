import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Calendar,
  ClipboardList,
  Inbox,
  Smartphone,
  Settings,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { usePractice } from '../context/PracticeContext';
import { publicAppointmentsPath } from '../lib/booking';
import logo from '../assets/Praxient-Logo.jpeg';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/profile', icon: User, label: 'Practice Profile' },
  { to: '/dashboard/availability', icon: Calendar, label: 'Availability' },
  { to: '/dashboard/appointment-types', icon: ClipboardList, label: 'Appointment Types' },
  { to: '/dashboard/appointments', icon: Inbox, label: 'Appointments' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
    isActive
      ? 'bg-navy-100 text-navy-900 font-semibold'
      : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
  }`;

export const DashboardLayout: React.FC = () => {
  const { practice, loading, error } = usePractice();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const publicPageUrl = practice ? publicAppointmentsPath(practice.slug) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-900/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky inset-y-0 lg:inset-y-auto lg:top-0 left-0 z-50 lg:z-30 w-64 h-full lg:h-screen bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 rounded-lg bg-paper border border-slate-200/70 px-3 py-2.5">
                <img
                  src={logo}
                  alt="Praxient — Healthcare Connected"
                  className="h-9 w-full object-contain"
                />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden ml-3 text-slate-400 hover:text-slate-600"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Practice
            </p>
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setIsSidebarOpen(false)}
                  className={navLinkClasses}
                >
                  <item.icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              ))}
            </div>

            <p className="px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Coming soon
            </p>
            <div className="space-y-0.5">
              <NavLink
                to="/dashboard/patient-app"
                onClick={() => setIsSidebarOpen(false)}
                className={navLinkClasses}
              >
                <Smartphone className="w-[18px] h-[18px]" strokeWidth={1.75} />
                Patient App Preview
              </NavLink>
            </div>
          </nav>

          {/* Practice identity */}
          <div className="px-4 py-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-navy-800 text-white flex items-center justify-center text-sm font-semibold">
                {(practice?.practitionerName || 'P')
                  .replace(/^Dr\.?\s*/i, '')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {practice?.practitionerName || 'Demo practice'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {practice?.practiceName || 'Praxient demo'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-slate-900"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                Demo environment
              </span>
            </div>
            <div className="flex items-center gap-2">
              {publicPageUrl && (
                <a
                  href={publicPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-navy-800 hover:bg-navy-50 transition-colors"
                >
                  View public page
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-navy-800"></div>
            </div>
          ) : error ? (
            <div className="max-w-xl bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              {error}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
