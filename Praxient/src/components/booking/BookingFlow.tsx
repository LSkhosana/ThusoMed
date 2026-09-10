import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Shield,
  CreditCard,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  AppointmentType,
  AvailabilitySettings,
  FormAnswers,
  PaymentStatus,
  PracticeProfile,
} from '../../types';
import { DynamicFormFields } from './DynamicFormFields';
import {
  calculateDepositAmount,
  collectAnswerText,
  extractPatientFields,
  formatRand,
  generateConfirmationNumber,
  generateTimeSlots,
  missingRequiredFields,
  toLocalDateString,
} from '../../lib/booking';
import {
  countTypeBookingsForDate,
  createAppointment,
  getOccupiedTimes,
  isSlotTaken,
  updateAppointment,
} from '../../lib/api';

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
  { number: 1, title: 'Choose Date' },
  { number: 2, title: 'Select Time' },
  { number: 3, title: 'Your Details' },
  { number: 4, title: 'Pre-Consultation' },
  { number: 5, title: 'Confirmation' },
];

interface BookingFlowProps {
  practice: PracticeProfile;
  availability: AvailabilitySettings;
  appointmentType: AppointmentType;
  compact?: boolean;
  /** When true, no data is written to the database (used by the admin Preview tab). */
  previewMode?: boolean;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  practice,
  availability,
  appointmentType,
  compact = false,
  previewMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingAnswers, setBookingAnswers] = useState<FormAnswers>({});
  const [preConsultationAnswers, setPreConsultationAnswers] = useState<FormAnswers>({});
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('not_required');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setCurrentStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setBookingAnswers({});
    setPreConsultationAnswers({});
    setBookingComplete(false);
    setConfirmationNumber('');
    setAppointmentId(null);
  }, [appointmentType.id]);

  useEffect(() => {
    if (!selectedDate) {
      setOccupiedTimes([]);
      return;
    }
    void getOccupiedTimes(selectedDate).then(setOccupiedTimes).catch(() => setOccupiedTimes([]));
  }, [selectedDate]);

  const availableDates = useMemo(() => {
    const today = new Date();
    const dates: { date: string; available: boolean }[] = [];

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = toLocalDateString(date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isBlocked = availability.blockedDates.includes(dateStr);
      const isAvailableDay = availability.availableDays.includes(dayName);
      dates.push({
        date: dateStr,
        available: !isBlocked && isAvailableDay,
      });
    }
    return dates;
  }, [availability]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.breakStart,
      availability.breakEnd,
      availability.slotIntervalMinutes,
      occupiedTimes
    );
  }, [availability, occupiedTimes, selectedDate]);

  const checkForEmergency = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return EMERGENCY_TERMS.some((term) => lowerText.includes(term));
  };

  const handleNext = () => {
    if (currentStep === 3 && checkForEmergency(collectAnswerText(bookingAnswers))) {
      setShowEmergencyModal(true);
      return;
    }
    if (currentStep === 4 && checkForEmergency(collectAnswerText(preConsultationAnswers))) {
      setShowEmergencyModal(true);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleSubmitBooking = async () => {
    const bookingMissing = missingRequiredFields(
      appointmentType.bookingFormFields,
      bookingAnswers
    );
    const preMissing = missingRequiredFields(
      appointmentType.preConsultationFormFields,
      preConsultationAnswers
    );
    if (bookingMissing.length || preMissing.length) {
      showToast(`Please complete: ${[...bookingMissing, ...preMissing].join(', ')}`, 'error');
      return;
    }

    if (previewMode) {
      // Preview never writes to the database.
      setAppointmentId(null);
      setConfirmationNumber(generateConfirmationNumber(appointmentType.name));
      setPaymentStatus(appointmentType.requiresDeposit ? 'pending' : 'not_required');
      setPaymentAmount(calculateDepositAmount(appointmentType));
      setBookingComplete(true);
      setCurrentStep(5);
      showToast('Preview complete — nothing was saved.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const taken = await isSlotTaken(selectedDate, selectedTime);
      if (taken) {
        showToast('That date and time is already booked. Please choose another slot.', 'error');
        const times = await getOccupiedTimes(selectedDate);
        setOccupiedTimes(times);
        setSelectedTime('');
        setCurrentStep(2);
        return;
      }

      const typeCount = await countTypeBookingsForDate(appointmentType.id, selectedDate);
      if (typeCount >= appointmentType.maxBookingsPerDay) {
        showToast('This appointment type is fully booked for the selected date.', 'error');
        setCurrentStep(1);
        return;
      }

      const confirmation = generateConfirmationNumber(appointmentType.name);
      const amount = calculateDepositAmount(appointmentType);
      const nextPaymentStatus: PaymentStatus = appointmentType.requiresDeposit
        ? 'pending'
        : 'not_required';
      const patient = extractPatientFields({ ...bookingAnswers, ...preConsultationAnswers });

      const created = await createAppointment({
        practiceId: practice.id,
        appointmentTypeId: appointmentType.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        bookingAnswers,
        preConsultationAnswers,
        patientDisplayName: patient.displayName,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        paymentStatus: nextPaymentStatus,
        paymentAmount: amount,
        confirmationNumber: confirmation,
      });

      setAppointmentId(created.id);
      setConfirmationNumber(created.confirmationNumber);
      setPaymentStatus(created.paymentStatus);
      setPaymentAmount(created.paymentAmount);
      setBookingComplete(true);
      setCurrentStep(5);
      showToast('Booking submitted successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to create booking', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockPay = async (status: 'paid' | 'failed') => {
    if (previewMode) {
      setPaymentStatus(status);
      showToast('Preview only — payment state not saved.', 'info');
      return;
    }
    if (!appointmentId) return;
    try {
      const updated = await updateAppointment(appointmentId, { paymentStatus: status });
      setPaymentStatus(updated.paymentStatus);
      showToast(
        status === 'paid' ? 'Mock payment marked as paid.' : 'Mock payment marked as failed.',
        status === 'paid' ? 'success' : 'warning'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to update payment', 'error');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedDate !== '';
      case 2:
        return selectedTime !== '';
      case 3:
        return missingRequiredFields(appointmentType.bookingFormFields, bookingAnswers).length === 0;
      case 4:
        return (
          missingRequiredFields(appointmentType.preConsultationFormFields, preConsultationAnswers)
            .length === 0
        );
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Select a Date</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {availableDates.map((date) => {
                const dateObj = new Date(`${date.date}T00:00:00`);
                return (
                  <button
                    key={date.date}
                    onClick={() => date.available && setSelectedDate(date.date)}
                    disabled={!date.available}
                    className={`p-3 rounded-md text-center transition-all ${
                      selectedDate === date.date
                        ? 'bg-navy-800 text-white shadow-sm'
                        : date.available
                        ? 'bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-slate-900'
                        : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">{dateObj.getDate()}</div>
                    <div className="text-xs">
                      {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Select a Time</h3>
            {availableSlots.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No available times for this date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`p-3 rounded-md text-center text-sm font-medium tabular-nums transition-all ${
                      selectedTime === slot
                        ? 'bg-navy-800 text-white shadow-sm'
                        : 'bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-slate-900'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Details</h3>
            <DynamicFormFields
              fields={appointmentType.bookingFormFields}
              answers={bookingAnswers}
              onChange={(id, value) =>
                setBookingAnswers((prev) => ({ ...prev, [id]: value }))
              }
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pre-Consultation Form</h3>
            {practice.emergencyDisclaimer && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">{practice.emergencyDisclaimer}</p>
              </div>
            )}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-teal-700 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-teal-900">Privacy notice</p>
                  <p className="text-xs text-teal-800 mt-1">
                    This demo stores submitted answers in Supabase for the stakeholder walkthrough.
                  </p>
                </div>
              </div>
            </div>
            <DynamicFormFields
              fields={appointmentType.preConsultationFormFields}
              answers={preConsultationAnswers}
              onChange={(id, value) =>
                setPreConsultationAnswers((prev) => ({ ...prev, [id]: value }))
              }
            />
          </div>
        );
      case 5:
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-2">
              {previewMode ? 'Preview Complete' : 'Booking Confirmed'}
            </h3>
            <p className="text-slate-600 mb-6">
              {previewMode
                ? 'This is how patients see their confirmation. Nothing was saved.'
                : 'Your appointment has been submitted successfully.'}
            </p>
            <div className="bg-slate-50 rounded-lg p-6 text-left max-w-md mx-auto mb-6">
              <h4 className="font-semibold text-slate-900 mb-4">Appointment Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmation Number:</span>
                  <span className="font-mono font-bold text-teal-700">{confirmationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Appointment Type:</span>
                  <span className="font-medium">{appointmentType.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium">
                    {selectedDate
                      ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-ZA', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Practice:</span>
                  <span className="font-medium">{practice.practiceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-medium capitalize">{paymentStatus.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            {appointmentType.requiresDeposit && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 text-left max-w-md mx-auto mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-medium text-slate-900">
                    Mock payment · {formatRand(paymentAmount)}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Demo only. No payment gateway is connected.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void mockPay('paid')} disabled={paymentStatus === 'paid'}>
                    Mark paid
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void mockPay('failed')}
                    disabled={paymentStatus === 'failed'}
                  >
                    Mark failed
                  </Button>
                </div>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Demo Mode</p>
                  <p className="text-xs text-amber-700 mt-1">
                    No SMS or email is sent in this Praxient demo.
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

  return (
    <div className={compact ? '' : 'space-y-6'}>
      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-navy-800 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-teal-300 font-semibold">
                Booking with {practice.practiceName}
              </p>
              <h2 className="text-lg font-semibold text-white mt-0.5">{appointmentType.name}</h2>
              <p className="text-sm text-navy-200">
                {appointmentType.durationMinutes} min · {formatRand(appointmentType.price)}
              </p>
            </div>
            {previewMode && (
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/10 text-teal-200 border border-white/20">
                Preview
              </span>
            )}
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step.number ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {currentStep > step.number || bookingComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`hidden sm:block ml-2 text-sm ${
                    currentStep >= step.number ? 'text-slate-900 font-medium' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-8 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">{renderStepContent()}</div>
        {currentStep < 5 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep((step) => Math.max(step - 1, 1))} disabled={currentStep === 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {currentStep === 4 ? (
              <Button onClick={() => void handleSubmitBooking()} disabled={!canProceed() || isSubmitting} isLoading={isSubmitting}>
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
            If you are experiencing a medical emergency, please call emergency services or go to
            your nearest emergency room immediately.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-red-800">Emergency Numbers</p>
            <p className="text-lg font-bold text-red-900 mt-1">10177 (Ambulance)</p>
          </div>
          <Button variant="danger" className="w-full" onClick={() => setShowEmergencyModal(false)}>
            I understand, close this message
          </Button>
        </div>
      </Modal>
    </div>
  );
};
