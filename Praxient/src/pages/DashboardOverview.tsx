import React, { useMemo } from 'react';
import {
  Calendar,
  Clock,
  ClipboardList,
  CheckCircle,
  User,
  Code,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';

export const DashboardOverview: React.FC = () => {
  const { account } = useAuth();

  const stats = useMemo(() => {
    const appointments = storage.getAppointments();
    const appointmentTypes = storage.getAppointmentTypes();
    const profile = storage.getProfile();
    const bookingForms = storage.getBookingForms();

    // Calculate appointments this week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const appointmentsThisWeek = appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate >= weekStart && aptDate <= weekEnd;
    }).length;

    const pendingBookings = appointments.filter(
      (apt) => apt.status === 'pending'
    ).length;

    const activeAppointmentTypes = appointmentTypes.filter(
      (type) => type.isActive
    ).length;

    const bookingFormStatus =
      bookingForms.length > 0 && bookingForms[0].isActive ? 'active' : 'inactive';

    // Calculate profile completion
    let profileCompletion = 0;
    if (profile) {
      const requiredFields = [
        'practiceName',
        'practitionerName',
        'specialty',
        'hpcsaNumber',
        'phone',
        'email',
        'address',
        'city',
        'province',
      ] as const;
      const filledFields = requiredFields.filter(
        (field) => profile[field] && profile[field].toString().trim() !== ''
      );
      profileCompletion = Math.round((filledFields.length / requiredFields.length) * 100);
    }

    return {
      appointmentsThisWeek,
      pendingBookings,
      activeAppointmentTypes,
      bookingFormStatus,
      profileCompletion,
      embedStatus: profile ? 'configured' : 'not_configured',
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome back, {account?.doctorName || 'Doctor'}
        </h1>
        <p className="text-slate-600">
          Manage your practice profile, appointment schedule, booking forms, and
          website embeds from one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.appointmentsThisWeek}
          </p>
          <p className="text-sm text-slate-500">Appointments this week</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.pendingBookings}
          </p>
          <p className="text-sm text-slate-500">Pending bookings</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.activeAppointmentTypes}
          </p>
          <p className="text-sm text-slate-500">Active appointment types</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 capitalize">
            {stats.bookingFormStatus}
          </p>
          <p className="text-sm text-slate-500">Booking form status</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.profileCompletion}%
          </p>
          <p className="text-sm text-slate-500">Profile completion</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 capitalize">
            {stats.embedStatus === 'configured' ? 'Ready' : 'Not Ready'}
          </p>
          <p className="text-sm text-slate-500">Embed status</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/dashboard/profile"
          className="group bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-sky-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">
            Practice Profile
          </h3>
          <p className="text-sm text-slate-500">
            Update your practice information and settings
          </p>
        </Link>

        <Link
          to="/dashboard/schedule"
          className="group bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">
            Appointment Schedule
          </h3>
          <p className="text-sm text-slate-500">
            Configure appointment types and availability
          </p>
        </Link>

        <Link
          to="/dashboard/embeds"
          className="group bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-amber-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Embed Widgets</h3>
          <p className="text-sm text-slate-500">
            Add booking widgets to your website
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" subtitle="Latest appointment requests">
        <div className="space-y-3">
          {storage.getAppointments().slice(0, 5).map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    apt.status === 'pending'
                      ? 'bg-amber-500'
                      : apt.status === 'confirmed'
                      ? 'bg-emerald-500'
                      : apt.status === 'cancelled'
                      ? 'bg-red-500'
                      : 'bg-slate-400'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {apt.patientFirstName} {apt.patientLastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(apt.date).toLocaleDateString('en-ZA')} at{' '}
                    {apt.time}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  apt.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : apt.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : apt.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {apt.status}
              </span>
            </div>
          ))}
          {storage.getAppointments().length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No appointments yet
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
