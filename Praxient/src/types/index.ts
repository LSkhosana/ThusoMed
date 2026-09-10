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

export interface PracticeProfile {
  id: string;
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
  operatingHours: {
    weekdays: { start: string; end: string };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
  emergencyDisclaimer: string;
  profileImage: string | null;
}

export interface AppointmentType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number;
  depositType: 'percentage' | 'fixed';
  maxBookingsPerDay: number;
  isActive: boolean;
}

export interface ScheduleSettings {
  availableDays: string[];
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  slotInterval: number;
  blockedDates: string[];
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

export interface Appointment {
  id: string;
  appointmentTypeId: string;
  date: string;
  time: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone: string;
  reasonForVisit: string;
  hasMedicalAid: boolean;
  medicalAidScheme?: string;
  memberNumber?: string;
  currentMedications?: string;
  allergies?: string;
  recentSymptoms?: string;
  formAnswers: Record<string, string>;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed';
  isPriority: boolean;
  notes: string;
  confirmationNumber: string;
  createdAt: string;
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

export interface DashboardStats {
  appointmentsThisWeek: number;
  pendingBookings: number;
  activeAppointmentTypes: number;
  bookingFormStatus: 'active' | 'inactive';
  profileCompletionPercentage: number;
  embedStatus: 'configured' | 'not_configured';
}
