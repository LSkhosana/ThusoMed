export interface PracticeAccount {
  id: string;
  practiceName: string;
  doctorName: string;
  email: string;
  phone: string;
  specialty: string;
  password: string;
  createdAt: string;
}

export interface OperatingHours {
  weekdays: { start: string; end: string };
  saturday: { start: string; end: string; enabled: boolean };
  sunday: { start: string; end: string; enabled: boolean };
}

export interface PracticeProfile {
  id: string;
  slug: string;
  practiceName: string;
  practitionerName: string;
  specialty: string;
  hpcsaNumber: string;
  description: string;
  services: string[];
  medicalAids: string[];
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website: string;
  operatingHours: OperatingHours;
  emergencyDisclaimer: string;
  profileImageUrl: string | null;
  brandingColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentType {
  id: string;
  practiceId: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number;
  depositType: 'percentage' | 'fixed';
  maxBookingsPerDay: number;
  isActive: boolean;
  isPublished: boolean;
  bookingFormFields: BookingFormField[];
  preConsultationFormFields: BookingFormField[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySettings {
  id: string;
  practiceId: string;
  availableDays: string[];
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  slotIntervalMinutes: number;
  blockedDates: string[];
  updatedAt: string;
}

export interface BookingFormField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'yesno';
  label: string;
  required: boolean;
  placeholder: string;
  helpText: string;
  options?: string[];
  order: number;
}

export interface BookingForm {
  id: string;
  appointmentTypeId: string;
  name: string;
  fields: BookingFormField[];
  isActive: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'not_required' | 'pending' | 'paid' | 'failed';
export type FormAnswers = Record<string, string | boolean | string[]>;

export interface Appointment {
  id: string;
  practiceId: string;
  appointmentTypeId: string;
  appointmentDate: string;
  appointmentTime: string;
  bookingAnswers: FormAnswers;
  preConsultationAnswers: FormAnswers;
  patientDisplayName: string;
  patientEmail: string;
  patientPhone: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  confirmationNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  brandingColor: string;
  smsRemindersEnabled: boolean;
  emailConfirmationsEnabled: boolean;
  paymentRequired: boolean;
  medicalAidAccepted: boolean;
  notifications: {
    newBooking: boolean;
    cancellation: boolean;
    reminder: boolean;
  };
}

export type ScheduleSettings = AvailabilitySettings;

export interface DashboardStats {
  appointmentsThisWeek: number;
  pendingBookings: number;
  activeAppointmentTypes: number;
  bookingFormStatus: 'active' | 'inactive';
  profileCompletionPercentage: number;
  embedStatus: 'configured' | 'not_configured';
}
