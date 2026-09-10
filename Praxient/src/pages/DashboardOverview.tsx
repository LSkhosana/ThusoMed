import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  ClipboardList,
  CheckCircle,
  User,
  Link as LinkIcon,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { usePractice } from '../context/PracticeContext';
import { listAppointmentTypes, listAppointments } from '../lib/api';
import { Appointment, AppointmentType } from '../types';

const DEMO_STEPS = [
  { step: 1, label: 'Update Practice Profile', to: '/dashboard/profile' },
  { step: 2, label: 'Set Availability', to: '/dashboard/availability' },
  { step: 3, label: 'Create an Appointment Type', to: '/dashboard/appointment-types' },
  { step: 4, label: 'Configure Booking Form', to: '/dashboard/appointment-types' },
  { step: 5, label: 'Configure Pre-Consultation Form', to: '/dashboard/appointment-types' },
  { step: 6, label: 'Preview', to: '/dashboard/appointment-types' },
  { step: 7, label: 'Publish', to: '/dashboard/appointment-types' },
  { step: 8, label: 'Share the booking-page link', to: '/dashboard/appointment-types' },
  { step: 9, label: 'Patient books on the public page', to: '/dashboard/appointment-types' },
  { step: 10, label: 'Manage the booking in Appointments', to: '/dashboard/appointments' },
];

export const DashboardOverview: React.FC = () => {
  const { practice } = usePractice();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);

  useEffect(() => {
    if (!practice) return;
    void Promise.all([
      listAppointments(practice.id),
      listAppointmentTypes(practice.id),
    ]).then(([loadedAppointments, loadedTypes]) => {
      setAppointments(loadedAppointments);
      setAppointmentTypes(loadedTypes);
    });
  }, [practice]);

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const appointmentsThisWeek = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= weekStart && aptDate <= weekEnd;
    }).length;

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
    const filledFields = practice
      ? requiredFields.filter((field) => practice[field] && practice[field].toString().trim() !== '')
      : [];

    return {
      appointmentsThisWeek,
      pendingBookings: appointments.filter((apt) => apt.status === 'pending').length,
      activeAppointmentTypes: appointmentTypes.filter((type) => type.isActive).length,
      publishedTypes: appointmentTypes.filter((type) => type.isPublished).length,
      profileCompletion: practice
        ? Math.round((filledFields.length / requiredFields.length) * 100)
        : 0,
    };
  }, [appointments, appointmentTypes, practice]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome back, {practice?.practitionerName || 'Doctor'}
        </h1>
        <p className="text-slate-600">
          Use this Praxient demo to publish an appointment type and share a public booking link.
        </p>
      </div>

      <Card title="Demo flow" subtitle="Walk through these steps for the stakeholder demo">
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEMO_STEPS.map((item) => (
            <li key={item.step}>
              <Link
                to={item.to}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm font-semibold flex items-center justify-center">
                  {item.step}
                </span>
                <span className="text-sm font-medium text-slate-800">{item.label}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.appointmentsThisWeek}</p>
          <p className="text-sm text-slate-500">Appointments this week</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.pendingBookings}</p>
          <p className="text-sm text-slate-500">Pending bookings</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.activeAppointmentTypes}</p>
          <p className="text-sm text-slate-500">Active appointment types</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.publishedTypes}</p>
          <p className="text-sm text-slate-500">Published types</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.profileCompletion}%</p>
          <p className="text-sm text-slate-500">Profile completion</p>
        </Card>
      </div>

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
          <h3 className="font-semibold text-slate-900 mb-1">Practice Profile</h3>
          <p className="text-sm text-slate-500">Update the single demo practice</p>
        </Link>
        <Link
          to="/dashboard/availability"
          className="group bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Availability</h3>
          <p className="text-sm text-slate-500">Set one schedule across selected days</p>
        </Link>
        <Link
          to="/dashboard/appointment-types"
          className="group bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-amber-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Publish & share</h3>
          <p className="text-sm text-slate-500">Create a public Praxient booking link</p>
        </Link>
      </div>

      <Card title="Recent Activity" subtitle="Latest appointment requests">
        <div className="space-y-3">
          {appointments.slice(0, 5).map((apt) => (
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
                  <p className="text-sm font-medium text-slate-900">{apt.patientDisplayName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(apt.appointmentDate).toLocaleDateString('en-ZA')} at {apt.appointmentTime}
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
          {appointments.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No appointments yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};
