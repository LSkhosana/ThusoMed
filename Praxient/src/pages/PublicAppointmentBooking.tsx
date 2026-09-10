import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BookingFlow } from '../components/booking/BookingFlow';
import {
  AppointmentType,
  AvailabilitySettings,
  PracticeProfile,
} from '../types';
import {
  getAvailability,
  getPracticeBySlug,
  getPublishedAppointmentType,
} from '../lib/api';
import { publicAppointmentsPath } from '../lib/booking';
import { isSupabaseConfigured } from '../lib/supabase';
import logo from '../assets/Praxient-Logo.jpeg';

const PublicBookingInner: React.FC = () => {
  const { practiceSlug, appointmentSlug } = useParams();
  const [practice, setPractice] = useState<PracticeProfile | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySettings | null>(null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured) {
        setError('This Praxient demo needs Supabase environment variables.');
        setLoading(false);
        return;
      }
      if (!practiceSlug || !appointmentSlug) return;
      const loadedPractice = await getPracticeBySlug(practiceSlug);
      if (!loadedPractice) {
        setError('Practice not found.');
        setLoading(false);
        return;
      }
      const loadedType = await getPublishedAppointmentType(loadedPractice.id, appointmentSlug);
      if (!loadedType) {
        setError('This appointment type is not available.');
        setLoading(false);
        return;
      }
      const loadedAvailability = await getAvailability(loadedPractice.id);
      setPractice(loadedPractice);
      setAppointmentType(loadedType);
      setAvailability(loadedAvailability);
      setLoading(false);
    };
    void load().catch((err) => {
      setError(err instanceof Error ? err.message : 'Unable to load booking page');
      setLoading(false);
    });
  }, [practiceSlug, appointmentSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-navy-800"></div>
      </div>
    );
  }

  if (error || !practice || !appointmentType || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <p className="text-slate-600">{error || 'Booking page not available.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-paper border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <img
            src={logo}
            alt="Praxient — Healthcare Connected"
            className="h-11 w-auto object-contain"
          />
          <Link
            to={publicAppointmentsPath(practice.slug)}
            className="inline-flex items-center gap-1 text-sm font-medium text-navy-800 hover:text-teal-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            All appointments
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <BookingFlow
          practice={practice}
          availability={availability}
          appointmentType={appointmentType}
        />
        <p className="text-center text-xs text-slate-400 pt-8 pb-4">
          Powered by Praxient · Healthcare Connected
        </p>
      </main>
    </div>
  );
};

export const PublicAppointmentBookingPage: React.FC = () => {
  return <PublicBookingInner />;
};
