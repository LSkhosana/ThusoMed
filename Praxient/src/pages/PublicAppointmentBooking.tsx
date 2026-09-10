import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !practice || !appointmentType || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-600">{error || 'Booking page not available.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">Praxient</p>
              <p className="text-xs text-slate-400">{practice.practiceName}</p>
            </div>
          </div>
          <Link
            to={publicAppointmentsPath(practice.slug)}
            className="text-sm text-slate-300 hover:text-white"
          >
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
      </main>
    </div>
  );
};

export const PublicAppointmentBookingPage: React.FC = () => {
  return <PublicBookingInner />;
};
