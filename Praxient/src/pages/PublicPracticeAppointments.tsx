import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AppointmentType, PracticeProfile } from '../types';
import {
  getPracticeBySlug,
  listPublishedAppointmentTypes,
} from '../lib/api';
import { formatRand, publicBookingPath } from '../lib/booking';
import { isSupabaseConfigured } from '../lib/supabase';
import logo from '../assets/Praxient-Logo.jpeg';

export const PublicPracticeAppointmentsPage: React.FC = () => {
  const { practiceSlug } = useParams();
  const [practice, setPractice] = useState<PracticeProfile | null>(null);
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured) {
        setError('This Praxient demo needs Supabase environment variables.');
        setLoading(false);
        return;
      }
      if (!practiceSlug) return;
      const loaded = await getPracticeBySlug(practiceSlug);
      if (!loaded) {
        setError('Practice not found.');
        setLoading(false);
        return;
      }
      const published = await listPublishedAppointmentTypes(loaded.id);
      setPractice(loaded);
      setTypes(published);
      setLoading(false);
    };
    void load().catch((err) => {
      setError(err instanceof Error ? err.message : 'Unable to load practice');
      setLoading(false);
    });
  }, [practiceSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-navy-800"></div>
      </div>
    );
  }

  if (error || !practice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <p className="text-slate-600">{error || 'Practice not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-paper border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center">
          <img
            src={logo}
            alt="Praxient — Healthcare Connected"
            className="h-12 w-auto object-contain"
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-navy-800 to-teal-500" />
          <div className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
              {practice.practiceName}
            </h1>
            <p className="text-teal-700 font-medium">{practice.practitionerName}</p>
            <p className="text-sm text-slate-500">{practice.specialty}</p>
          </div>
          {practice.hpcsaNumber && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <Shield className="w-4 h-4" />
              HPCSA: {practice.hpcsaNumber}
            </div>
          )}
          {practice.description && <p className="text-sm text-slate-600">{practice.description}</p>}
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              {[practice.address, practice.city, practice.province].filter(Boolean).join(', ')}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              {practice.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              {practice.email}
            </div>
          </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-navy-900">Available appointments</h2>
          {types.length === 0 && (
            <p className="text-sm text-slate-500">No published appointment types yet.</p>
          )}
          {types.map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:border-teal-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy-900">{type.name}</h3>
                  {type.description && (
                    <p className="text-sm text-slate-600 mt-1">{type.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[13px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {type.durationMinutes} min
                    </span>
                    <span className="font-medium text-navy-800">{formatRand(type.price)}</span>
                  </div>
                </div>
                <Link to={publicBookingPath(practice.slug, type.slug)} className="shrink-0">
                  <Button>Book appointment</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 pt-2 pb-6">
          Powered by Praxient · Healthcare Connected
        </p>
      </main>
    </div>
  );
};
