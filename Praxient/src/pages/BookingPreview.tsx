import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { storage } from '../utils/storage';
import { AppointmentType, Appointment, PracticeProfile } from '../types';

const EMERGENCY_TERMS = [
  'emergency',
  'severe chest pain',
  'chest pain',
  'bleeding',
  'collapse',
  'unconscious',
  'cannot breathe',
  'stroke',
  'heart attack',
  'severe headache',
  'difficulty breathing',
];

const STEPS = [
  { number: 1, title: 'Select Appointment' },
  { number: 2, title: 'Choose Date' },
  { number: 3, title: 'Select Time' },
  { number: 4, title: 'Your Details' },
  { number: 5, title: 'Pre-Consultation' },
  { number: 6, title: 'Confirmation' },
];

export const BookingPreviewPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [profile, setProfile] = useState<PracticeProfile | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const { showToast } = useToast();

  // Patient details state
  const [patientDetails, setPatientDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reasonForVisit: '',
    hasMedicalAid: false,
    medicalAidScheme: '',
    memberNumber: '',
    currentMedications: '',
    allergies: '',
    recentSymptoms: '',
    consent: false,
  });

  useEffect(() => {
    const types = storage.getAppointmentTypes().filter((t) => t.isActive);
    setAppointmentTypes(types);
    const savedProfile = storage.getProfile();
    setProfile(savedProfile);
  }, []);

  const checkForEmergency = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return EMERGENCY_TERMS.some((term) => lowerText.includes(term));
  };

  const handleNext = () => {
    if (currentStep === 4) {
      // Check for emergency in reason for visit
      if (checkForEmergency(patientDetails.reasonForVisit)) {
        setShowEmergencyModal(true);
        return;
      }
    }
    if (currentStep === 5) {
      // Check for emergency in symptoms
      if (checkForEmergency(patientDetails.recentSymptoms)) {
        setShowEmergencyModal(true);
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitBooking = () => {
    if (!selectedType || !selectedDate || !selectedTime || !profile) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    if (!patientDetails.consent) {
      showToast('Please accept the consent checkbox', 'error');
      return;
    }

    const confirmation = `${selectedType.name.substring(0, 2).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setConfirmationNumber(confirmation);

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substring(2, 15),
      appointmentTypeId: selectedType.id,
      date: selectedDate,
      time: selectedTime,
      patientFirstName: patientDetails.firstName,
      patientLastName: patientDetails.lastName,
      patientEmail: patientDetails.email,
      patientPhone: patientDetails.phone,
      reasonForVisit: patientDetails.reasonForVisit,
      hasMedicalAid: patientDetails.hasMedicalAid,
      medicalAidScheme: patientDetails.medicalAidScheme || undefined,
      memberNumber: patientDetails.memberNumber || undefined,
      currentMedications: patientDetails.currentMedications || undefined,
      allergies: patientDetails.allergies || undefined,
      recentSymptoms: patientDetails.recentSymptoms || undefined,
      formAnswers: {},
      status: 'pending',
      paymentStatus: selectedType.requiresDeposit ? 'pending' : 'not_required',
      isPriority: checkForEmergency(patientDetails.reasonForVisit) || checkForEmergency(patientDetails.recentSymptoms),
      notes: '',
      confirmationNumber: confirmation,
      createdAt: new Date().toISOString(),
    };

    const existingAppointments = storage.getAppointments();
    storage.setAppointments([...existingAppointments, newAppointment]);

    setBookingComplete(true);
    setCurrentStep(6);
    showToast('Booking submitted successfully!', 'success');
  };

  // Generate available dates for next 14 days
  const availableDates = useMemo(() => {
    const schedule = storage.getScheduleSettings();
    const today = new Date();
    const dates: { date: string; available: boolean; reason?: string }[] = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i + 1);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      const isBlocked = schedule?.blockedDates.includes(dateStr);
      const isAvailableDay = schedule?.availableDays.includes(dayName);
      const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
      const isSunday = dayName === 'Sunday';

      // Check if max bookings reached for selected appointment type
      const existingBookings = storage.getAppointments().filter(
        (apt) => apt.date === dateStr && apt.appointmentTypeId === selectedType?.id
      ).length;
      const maxReached = existingBookings >= (selectedType?.maxBookingsPerDay || 100);

      dates.push({
        date: dateStr,
        available: !isBlocked && isAvailableDay && !maxReached,
        reason: isBlocked
          ? 'Blocked'
          : !isAvailableDay
          ? isSunday
            ? 'Sunday closed'
            : isWeekend
            ? 'Weekend'
            : 'Not available'
          : maxReached
          ? 'Fully booked'
          : undefined,
      });
    }
    return dates;
  }, [selectedType]);

  // Generate available time slots
  const availableSlots = useMemo(() => {
    const schedule = storage.getScheduleSettings();
    if (!schedule || !selectedDate) return [];

    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const isSaturday = dayName === 'Saturday';
    const isSunday = dayName === 'Sunday';

    const startTime = isSaturday
      ? schedule.saturday.enabled
        ? schedule.saturday.start
        : '00:00'
      : isSunday
      ? schedule.sunday.enabled
        ? schedule.sunday.start
        : '00:00'
      : schedule.startTime;
    const endTime = isSaturday
      ? schedule.saturday.enabled
        ? schedule.saturday.end
        : '00:00'
      : isSunday
      ? schedule.sunday.enabled
        ? schedule.sunday.end
        : '00:00'
      : schedule.endTime;

    if (startTime === '00:00' && endTime === '00:00') return [];

    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const [breakStartHour, breakStartMin] = schedule.breakStart.split(':').map(Number);
    const [breakEndHour, breakEndMin] = schedule.breakEnd.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const breakStartMinutes = breakStartHour * 60 + breakStartMin;
    const breakEndMinutes = breakEndHour * 60 + breakEndMin;
    const interval = schedule.slotInterval;

    while (currentMinutes < endMinutes) {
      // Skip break time
      if (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
        currentMinutes = breakEndMinutes;
        continue;
      }

      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Check if slot is already booked
      const isBooked = storage.getAppointments().some(
        (apt) => apt.date === selectedDate && apt.time === timeStr
      );

      if (!isBooked) {
        slots.push(timeStr);
      }

      currentMinutes += interval;
    }

    return slots;
  }, [selectedDate]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Select Appointment Type
            </h3>
            {appointmentTypes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No appointment types are currently available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointmentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedType?.id === type.id
                        ? 'border-sky-600 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">
                        {type.name}
                      </h4>
                      <span className="text-lg font-bold text-sky-600">
                        R{type.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {type.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {type.durationMinutes} min
                      </span>
                      {type.requiresDeposit && (
                        <span className="text-amber-600">
                          Deposit required
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Select a Date
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {availableDates.map((date) => {
                const dateObj = new Date(date.date);
                const dayName = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                });
                const dayNum = dateObj.getDate();
                const month = dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                });

                return (
                  <button
                    key={date.date}
                    onClick={() => date.available && setSelectedDate(date.date)}
                    disabled={!date.available}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedDate === date.date
                        ? 'bg-sky-600 text-white'
                        : date.available
                        ? 'bg-white border border-slate-200 hover:border-sky-300 text-slate-900'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-xs font-medium">{dayName}</div>
                    <div className="text-lg font-bold">{dayNum}</div>
                    <div className="text-xs">{month}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Select a Time
            </h3>
            {availableSlots.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No available times for this date.</p>
                <p className="text-sm mt-1">Please choose another date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedTime === slot
                        ? 'bg-sky-600 text-white'
                        : 'bg-white border border-slate-200 hover:border-sky-300 text-slate-900'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Your Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={patientDetails.firstName}
                onChange={(e) =>
                  setPatientDetails({
                    ...patientDetails,
                    firstName: e.target.value,
                  })
                }
                required
              />
              <Input
                label="Last Name"
                value={patientDetails.lastName}
                onChange={(e) =>
                  setPatientDetails({
                    ...patientDetails,
                    lastName: e.target.value,
                  })
                }
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={patientDetails.email}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, email: e.target.value })
              }
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={patientDetails.phone}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, phone: e.target.value })
              }
              required
            />
            <Textarea
              label="Reason for Visit"
              value={patientDetails.reasonForVisit}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  reasonForVisit: e.target.value,
                })
              }
              rows={3}
              required
              helpText="Describe your symptoms or reason for booking"
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Pre-Consultation Form
            </h3>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-sky-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-sky-900">
                    POPIA Notice
                  </p>
                  <p className="text-xs text-sky-700 mt-1">
                    Your information is securely stored and protected according to
                    POPIA requirements.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="hasMedicalAid"
                checked={patientDetails.hasMedicalAid}
                onChange={(e) =>
                  setPatientDetails({
                    ...patientDetails,
                    hasMedicalAid: e.target.checked,
                  })
                }
                className="rounded border-slate-300"
              />
              <label htmlFor="hasMedicalAid" className="text-sm text-slate-700">
                I have Medical Aid
              </label>
            </div>
            {patientDetails.hasMedicalAid && (
              <>
                <Select
                  label="Medical Aid Scheme"
                  options={[
                    { value: '', label: 'Select your scheme' },
                    { value: 'Discovery Health', label: 'Discovery Health' },
                    { value: 'Momentum Health', label: 'Momentum Health' },
                    { value: 'Bonitas', label: 'Bonitas' },
                    { value: 'Medihelp', label: 'Medihelp' },
                    { value: 'Fedhealth', label: 'Fedhealth' },
                    { value: 'GEMS', label: 'GEMS' },
                    { value: 'Profmed', label: 'Profmed' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={patientDetails.medicalAidScheme}
                  onChange={(e) =>
                    setPatientDetails({
                      ...patientDetails,
                      medicalAidScheme: e.target.value,
                    })
                  }
                />
                <Input
                  label="Member Number"
                  value={patientDetails.memberNumber}
                  onChange={(e) =>
                    setPatientDetails({
                      ...patientDetails,
                      memberNumber: e.target.value,
                    })
                  }
                />
              </>
            )}
            <Textarea
              label="Current Medications"
              value={patientDetails.currentMedications}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  currentMedications: e.target.value,
                })
              }
              rows={2}
            />
            <Textarea
              label="Allergies"
              value={patientDetails.allergies}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  allergies: e.target.value,
                })
              }
              rows={2}
            />
            <Textarea
              label="Recent Symptoms"
              value={patientDetails.recentSymptoms}
              onChange={(e) =>
                setPatientDetails({
                  ...patientDetails,
                  recentSymptoms: e.target.value,
                })
              }
              rows={3}
            />
            <div className="border-t border-slate-200 pt-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={patientDetails.consent}
                  onChange={(e) =>
                    setPatientDetails({
                      ...patientDetails,
                      consent: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 mt-1"
                />
                <span className="text-sm text-slate-700">
                  I consent to this practice collecting my information for
                  appointment booking and pre-consultation purposes.
                </span>
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-slate-600 mb-6">
              Your appointment has been submitted successfully.
            </p>

            <div className="bg-slate-50 rounded-lg p-6 text-left max-w-md mx-auto mb-6">
              <h4 className="font-semibold text-slate-900 mb-4">
                Appointment Details
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmation Number:</span>
                  <span className="font-mono font-bold text-sky-600">
                    {confirmationNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Appointment Type:</span>
                  <span className="font-medium">{selectedType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-ZA', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Practice:</span>
                  <span className="font-medium">{profile?.practiceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-medium">
                    {profile?.practitionerName}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Demo Mode
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    A confirmation SMS and email would be sent in the live
                    system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedType !== null;
      case 2:
        return selectedDate !== '';
      case 3:
        return selectedTime !== '';
      case 4:
        return (
          patientDetails.firstName !== '' &&
          patientDetails.lastName !== '' &&
          patientDetails.email !== '' &&
          patientDetails.phone !== '' &&
          patientDetails.reasonForVisit !== ''
        );
      case 5:
        return patientDetails.consent;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Preview</h1>
          <p className="text-slate-600">
            Preview the patient booking experience
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Practice: {profile?.practiceName}
        </div>
      </div>

      {/* Booking Form Container */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`hidden sm:block ml-2 text-sm ${
                    currentStep >= step.number
                      ? 'text-slate-900 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-12 h-0.5 mx-2 ${
                      currentStep > step.number
                        ? 'bg-sky-600'
                        : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {currentStep === 5 ? (
              <Button onClick={handleSubmitBooking} disabled={!canProceed()}>
                Submit Booking
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Emergency Modal */}
      <Modal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        title="Emergency Detected"
        size="md"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Please Do Not Use Online Booking for Emergencies
          </h3>
          <p className="text-slate-600 mb-6">
            If you are experiencing a medical emergency, please call emergency
            services or go to your nearest emergency room immediately.
          </p>
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">
                Emergency Numbers
              </p>
              <p className="text-lg font-bold text-red-900 mt-1">
                10177 (Ambulance)
              </p>
              <p className="text-sm text-red-700">
                or visit your nearest emergency room
              </p>
            </div>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setShowEmergencyModal(false)}
            >
              I understand, close this message
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
