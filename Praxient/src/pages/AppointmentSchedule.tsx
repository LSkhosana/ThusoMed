import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { storage } from '../utils/storage';
import { AppointmentType, ScheduleSettings } from '../types';

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
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Form state for new/edit appointment type
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
    requiresDeposit: false,
    depositAmount: 0,
    depositType: 'percentage' as 'percentage' | 'fixed',
    maxBookingsPerDay: 10,
    isActive: true,
  });

  useEffect(() => {
    const savedTypes = storage.getAppointmentTypes();
    const savedSettings = storage.getScheduleSettings();
    setAppointmentTypes(savedTypes);
    setScheduleSettings(
      savedSettings || {
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '08:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        slotInterval: 15,
        blockedDates: [],
      }
    );
  }, []);

  const saveAppointmentTypes = (types: AppointmentType[]) => {
    storage.setAppointmentTypes(types);
    setAppointmentTypes(types);
  };

  const saveScheduleSettings = (settings: ScheduleSettings) => {
    storage.setScheduleSettings(settings);
    setScheduleSettings(settings);
  };

  const handleOpenModal = (type?: AppointmentType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description,
        durationMinutes: type.durationMinutes,
        price: type.price,
        requiresDeposit: type.requiresDeposit,
        depositAmount: type.depositAmount,
        depositType: type.depositType,
        maxBookingsPerDay: type.maxBookingsPerDay,
        isActive: type.isActive,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        description: '',
        durationMinutes: 30,
        price: 0,
        requiresDeposit: false,
        depositAmount: 0,
        depositType: 'percentage',
        maxBookingsPerDay: 10,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  const handleSaveType = () => {
    if (formData.durationMinutes < 10) {
      showToast('Duration must be at least 10 minutes', 'error');
      return;
    }

    if (editingType) {
      const updated = appointmentTypes.map((type) =>
        type.id === editingType.id ? { ...type, ...formData } : type
      );
      saveAppointmentTypes(updated);
      showToast('Appointment type updated!', 'success');
    } else {
      const newType: AppointmentType = {
        id: Math.random().toString(36).substring(2, 15),
        ...formData,
      };
      saveAppointmentTypes([...appointmentTypes, newType]);
      showToast('Appointment type created!', 'success');
    }
    handleCloseModal();
  };

  const handleDeleteType = (id: string) => {
    if (confirm('Are you sure you want to delete this appointment type?')) {
      const updated = appointmentTypes.filter((type) => type.id !== id);
      saveAppointmentTypes(updated);
      showToast('Appointment type deleted', 'success');
    }
  };

  const toggleDay = (day: string) => {
    if (!scheduleSettings) return;
    const days = scheduleSettings.availableDays.includes(day)
      ? scheduleSettings.availableDays.filter((d) => d !== day)
      : [...scheduleSettings.availableDays, day];
    saveScheduleSettings({ ...scheduleSettings, availableDays: days });
  };

  const addBlockedDate = () => {
    if (!scheduleSettings) return;
    const date = prompt('Enter date to block (YYYY-MM-DD):');
    if (date && !scheduleSettings.blockedDates.includes(date)) {
      saveScheduleSettings({
        ...scheduleSettings,
        blockedDates: [...scheduleSettings.blockedDates, date],
      });
    }
  };

  const removeBlockedDate = (date: string) => {
    if (!scheduleSettings) return;
    saveScheduleSettings({
      ...scheduleSettings,
      blockedDates: scheduleSettings.blockedDates.filter((d) => d !== date),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Appointment Schedule
          </h1>
          <p className="text-slate-600">
            Manage appointment types and availability
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Appointment Type
        </Button>
      </div>

      {/* Appointment Types */}
      <Card title="Appointment Types" subtitle="Configure your consultation options">
        <div className="space-y-4">
          {appointmentTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    type.isActive
                      ? 'bg-sky-100 text-sky-600'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{type.name}</h3>
                  <p className="text-sm text-slate-500">{type.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {type.durationMinutes} min
                    </span>
                    <span className="font-medium">
                      R{type.price.toLocaleString()}
                    </span>
                    {type.requiresDeposit && (
                      <span className="text-amber-600">
                        Deposit: {type.depositType === 'percentage' ? `${type.depositAmount}%` : `R${type.depositAmount}`}
                      </span>
                    )}
                    <span>Max {type.maxBookingsPerDay}/day</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    type.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {type.isActive ? 'Active' : 'Inactive'}
                </div>
                <button
                  onClick={() => handleOpenModal(type)}
                  className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteType(type.id)}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {appointmentTypes.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No appointment types created yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => handleOpenModal()}
              >
                Create your first appointment type
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Schedule Settings */}
      {scheduleSettings && (
        <>
          <Card title="Availability Settings" subtitle="Configure your working hours">
            <div className="space-y-6">
              {/* Days */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Available Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => {
                    const isWeekend = day === 'Saturday' || day === 'Sunday';
                    const isActive = scheduleSettings.availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } ${isWeekend && !isActive ? 'border border-slate-300' : ''}`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                {scheduleSettings.availableDays.includes('Saturday') ||
                scheduleSettings.availableDays.includes('Sunday') ? (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Weekend availability enabled
                  </p>
                ) : null}
              </div>

              {/* Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  value={scheduleSettings.startTime}
                  onChange={(e) =>
                    saveScheduleSettings({
                      ...scheduleSettings,
                      startTime: e.target.value,
                    })
                  }
                />
                <Input
                  label="End Time"
                  type="time"
                  value={scheduleSettings.endTime}
                  onChange={(e) =>
                    saveScheduleSettings({
                      ...scheduleSettings,
                      endTime: e.target.value,
                    })
                  }
                  error={
                    scheduleSettings.endTime <= scheduleSettings.startTime
                      ? 'End time must be after start time'
                      : undefined
                  }
                />
              </div>

              {/* Break */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-3">Break Time</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Break Start"
                    type="time"
                    value={scheduleSettings.breakStart}
                    onChange={(e) =>
                      saveScheduleSettings({
                        ...scheduleSettings,
                        breakStart: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Break End"
                    type="time"
                    value={scheduleSettings.breakEnd}
                    onChange={(e) =>
                      saveScheduleSettings({
                        ...scheduleSettings,
                        breakEnd: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Slot Interval */}
              <div>
                <Select
                  label="Slot Interval"
                  options={[
                    { value: '10', label: '10 minutes' },
                    { value: '15', label: '15 minutes' },
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '60 minutes' },
                  ]}
                  value={scheduleSettings.slotInterval.toString()}
                  onChange={(e) =>
                    saveScheduleSettings({
                      ...scheduleSettings,
                      slotInterval: parseInt(e.target.value),
                    })
                  }
                  helpText="Time between available slots"
                />
              </div>
            </div>
          </Card>

          <Card title="Blocked Dates" subtitle="Dates when no appointments are available">
            <div className="space-y-4">
              <Button variant="outline" size="sm" onClick={addBlockedDate}>
                <Plus className="w-4 h-4 mr-2" />
                Block Date
              </Button>
              <div className="flex flex-wrap gap-2">
                {scheduleSettings.blockedDates.map((date) => (
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
                    <button
                      onClick={() => removeBlockedDate(date)}
                      className="hover:text-red-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {scheduleSettings.blockedDates.length === 0 && (
                  <p className="text-sm text-slate-500">No blocked dates</p>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingType ? 'Edit Appointment Type' : 'New Appointment Type'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g., General Consultation"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Describe what this appointment type includes"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationMinutes: parseInt(e.target.value) || 0,
                })
              }
              error={
                formData.durationMinutes < 10
                  ? 'Minimum 10 minutes required'
                  : undefined
              }
              required
            />
            <Input
              label="Price (ZAR)"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <Toggle
              label="Require Deposit"
              description="Patients must pay a deposit to confirm booking"
              checked={formData.requiresDeposit}
              onChange={(checked) =>
                setFormData({ ...formData, requiresDeposit: checked })
              }
            />
            {formData.requiresDeposit && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input
                  label="Deposit Amount"
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depositAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Select
                  label="Deposit Type"
                  options={[
                    { value: 'percentage', label: 'Percentage' },
                    { value: 'fixed', label: 'Fixed Amount' },
                  ]}
                  value={formData.depositType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depositType: e.target.value as 'percentage' | 'fixed',
                    })
                  }
                />
              </div>
            )}
          </div>

          <Input
            label="Max Bookings Per Day"
            type="number"
            value={formData.maxBookingsPerDay}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxBookingsPerDay: parseInt(e.target.value) || 1,
              })
            }
            helpText="Maximum number of this appointment type per day"
          />

          <div className="border-t border-slate-200 pt-4">
            <Toggle
              label="Active"
              description="This appointment type is available for booking"
              checked={formData.isActive}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveType} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              {editingType ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
