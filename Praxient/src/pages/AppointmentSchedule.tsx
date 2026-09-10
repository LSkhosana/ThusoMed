import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { usePractice } from '../context/PracticeContext';
import { updateAvailability } from '../lib/api';
import { AvailabilitySettings } from '../types';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const AppointmentSchedulePage: React.FC = () => {
  const { availability, setAvailability } = usePractice();
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null);
  const [blockedDateInput, setBlockedDateInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (availability) setSettings(availability);
  }, [availability]);

  const handleSave = async () => {
    if (!settings) return;
    if (settings.endTime <= settings.startTime) {
      showToast('End time must be after start time', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const saved = await updateAvailability(settings.id, settings);
      setSettings(saved);
      setAvailability(saved);
      showToast('Availability saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to save availability', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    if (!settings) return;
    const days = settings.availableDays.includes(day)
      ? settings.availableDays.filter((item) => item !== day)
      : [...settings.availableDays, day];
    setSettings({ ...settings, availableDays: days });
  };

  const addBlockedDate = () => {
    if (!settings || !blockedDateInput) return;
    if (settings.blockedDates.includes(blockedDateInput)) return;
    setSettings({
      ...settings,
      blockedDates: [...settings.blockedDates, blockedDateInput],
    });
    setBlockedDateInput('');
  };

  const removeBlockedDate = (date: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      blockedDates: settings.blockedDates.filter((item) => item !== date),
    });
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Availability</h1>
          <p className="text-slate-500 mt-1">
            One start and end time applies to every selected day in this demo.
          </p>
        </div>
        <Button onClick={() => void handleSave()} isLoading={isSaving}>
          <Check className="w-4 h-4 mr-2" />
          Save Availability
        </Button>
      </div>

      <Card title="Availability Settings" subtitle="Configure your working hours">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Available Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const isActive = settings.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-navy-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {settings.availableDays.includes('Saturday') ||
            settings.availableDays.includes('Sunday') ? (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Weekend days use the same start and end time as weekdays.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={settings.startTime}
              onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
            />
            <Input
              label="End Time"
              type="time"
              value={settings.endTime}
              onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
              error={
                settings.endTime <= settings.startTime
                  ? 'End time must be after start time'
                  : undefined
              }
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-3">Break Time</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Break Start"
                type="time"
                value={settings.breakStart || ''}
                onChange={(e) => setSettings({ ...settings, breakStart: e.target.value || null })}
              />
              <Input
                label="Break End"
                type="time"
                value={settings.breakEnd || ''}
                onChange={(e) => setSettings({ ...settings, breakEnd: e.target.value || null })}
              />
            </div>
          </div>

          <Select
            label="Slot Interval"
            options={[
              { value: '10', label: '10 minutes' },
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '60', label: '60 minutes' },
            ]}
            value={settings.slotIntervalMinutes.toString()}
            onChange={(e) =>
              setSettings({
                ...settings,
                slotIntervalMinutes: parseInt(e.target.value, 10),
              })
            }
            helpText="Time between available slots"
          />
        </div>
      </Card>

      <Card title="Blocked Dates" subtitle="Dates when no appointments are available">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="date"
              value={blockedDateInput}
              onChange={(e) => setBlockedDateInput(e.target.value)}
            />
            <Button variant="outline" onClick={addBlockedDate}>
              <Plus className="w-4 h-4 mr-2" />
              Block Date
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.blockedDates.map((date) => (
              <div
                key={date}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm"
              >
                <Calendar className="w-4 h-4" />
                {new Date(date).toLocaleDateString('en-ZA', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
                <button onClick={() => removeBlockedDate(date)} className="hover:text-red-900">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {settings.blockedDates.length === 0 && (
              <p className="text-sm text-slate-500">No blocked dates</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
