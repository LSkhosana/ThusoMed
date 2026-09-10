import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, MapPin, Phone, Mail, Shield, Stethoscope } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AppointmentType, PracticeProfile } from '../types';
import {
  getPracticeBySlug,
  listPublishedAppointmentTypes,
} from '../lib/api';
import { publicBookingPath } from '../lib/booking';
import { isSupabaseConfigured } from '../lib/supabase';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !practice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-600">{error || 'Practice not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Praxient</p>
            <p className="text-xs text-slate-400">Praxient by ThusoMed</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{practice.practiceName}</h1>
            <p className="text-sky-600 font-medium">{practice.practitionerName}</p>
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

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Available appointments</h2>
          {types.length === 0 && (
            <p className="text-sm text-slate-500">No published appointment types yet.</p>
          )}
          {types.map((type) => (
            <div key={type.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{type.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{type.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {type.durationMinutes} min
                    </span>
                    <span>R{type.price.toLocaleString()}</span>
                  </div>
                </div>
                <Link to={publicBookingPath(practice.slug, type.slug)}>
                  <Button>Book</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
