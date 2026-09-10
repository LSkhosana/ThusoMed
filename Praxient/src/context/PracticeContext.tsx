import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AvailabilitySettings, PracticeProfile } from '../types';
import { getAvailability, getPractice } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

interface PracticeContextValue {
  practice: PracticeProfile | null;
  availability: AvailabilitySettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setPractice: (practice: PracticeProfile) => void;
  setAvailability: (availability: AvailabilitySettings) => void;
}

const PracticeContext = createContext<PracticeContextValue | null>(null);

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [practice, setPractice] = useState<PracticeProfile | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to a local .env file.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const loadedPractice = await getPractice();
      const loadedAvailability = await getAvailability(loadedPractice.id);
      setPractice(loadedPractice);
      setAvailability(loadedAvailability);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load demo practice data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <PracticeContext.Provider
      value={{
        practice,
        availability,
        loading,
        error,
        refresh,
        setPractice,
        setAvailability,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};
