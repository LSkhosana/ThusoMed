import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, ClipboardList, CheckCircle, User, ArrowRight } from 'lucide-react';
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
  { step: 6, label: 'Preview the booking experience', to: '/dashboard/appointment-types' },
  { step: 7, label: 'Publish', to: '/dashboard/appointment-types' },
  { step: 8, label: 'Share the booking-page link', to: '/dashboard/appointment-types' },
  { step: 9, label: 'Patient books on the public page', to: '/dashboard/appointment-types' },
  { step: 10, label: 'Manage the booking in Appointments', to: '/dashboard/appointments' },
];

const STATUS_DOT: Record<Appointment['status'], string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  completed: 'bg-slate-400',
};

const STATUS_BADGE: Record<Appointment['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  completed: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const StatSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
    <div className="w-9 h-9 rounded-md bg-slate-100 mb-4" />
    <div className="h-6 w-12 bg-slate-100 rounded mb-2" />
    <div className="h-3 w-24 bg-slate-100 rounded" />
  </div>
);

export const DashboardOverview: React.FC = () => {
  const { practice } = usePractice();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!practice) return;
    let cancelled = false;
    void Promise.all([listAppointments(practice.id), listAppointmentTypes(practice.id)])
      .then(([loadedAppointments, loadedTypes]) => {
        if (cancelled) return;
        setAppointments(loadedAppointments);
        setAppointmentTypes(loadedTypes);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [practice]);

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

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
      ? requiredFields.filter(
          (field) => practice[field] && practice[field].toString().trim() !== ''
        )
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

  const statCards = [
    {
      icon: Calendar,
      iconClasses: 'bg-navy-100 text-navy-800',
      value: stats.appointmentsThisWeek,
      label: 'Appointments this week',
    },
    {
      icon: Clock,
      iconClasses: 'bg-amber-50 text-amber-600',
      value: stats.pendingBookings,
      label: 'Pending bookings',
    },
    {
      icon: ClipboardList,
      iconClasses: 'bg-teal-50 text-teal-700',
      value: stats.activeAppointmentTypes,
      label: 'Active appointment types',
    },
    {
      icon: CheckCircle,
      iconClasses: 'bg-emerald-50 text-emerald-600',
      value: stats.publishedTypes,
      label: 'Published types',
    },
    {
      icon: User,
      iconClasses: 'bg-slate-100 text-slate-600',
      value: `${stats.profileCompletion}%`,
      label: 'Profile completion',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
          Welcome back, {practice?.practitionerName || 'Doctor'}
        </h1>
        <p className="text-slate-500 mt-1">
          Publish an appointment type and share your public booking link.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => <StatSkeleton key={index} />)
          : statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-lg border border-slate-200 p-5">
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center mb-4 ${card.iconClasses}`}
                >
                  <card.icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </div>
                <p className="text-2xl font-bold text-navy-900 tabular-nums">{card.value}</p>
                <p className="text-[13px] text-slate-500 mt-0.5">{card.label}</p>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Demo flow */}
        <div className="lg:col-span-2">
          <Card title="Demo walkthrough" subtitle="The end-to-end flow for stakeholders">
            <ol className="space-y-1">
              {DEMO_STEPS.map((item) => (
                <li key={item.step}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-3 px-2 py-1.5 -mx-2 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <span className="w-6 h-6 shrink-0 rounded-full border border-navy-200 bg-navy-50 text-navy-800 text-[11px] font-semibold flex items-center justify-center tabular-nums">
                      {item.step}
                    </span>
                    <span className="text-sm text-slate-700 group-hover:text-navy-900">
                      {item.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-300 group-hover:text-teal-600 transition-colors" />
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-3">
          <Card title="Recent activity" subtitle="Latest appointment requests">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 bg-slate-50 border border-slate-100 rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 6).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 shrink-0 rounded-full ${STATUS_DOT[apt.status]}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {apt.patientDisplayName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(apt.appointmentDate).toLocaleDateString('en-ZA', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          · {apt.appointmentTime}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[apt.status]}`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-6">No appointments yet</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
