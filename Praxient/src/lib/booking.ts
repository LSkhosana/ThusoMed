import { AppointmentType, BookingFormField, FormAnswers } from '../types';

export const DEFAULT_BOOKING_FORM_FIELDS: BookingFormField[] = [
  {
    id: 'firstName',
    type: 'text',
    label: 'First Name',
    required: true,
    placeholder: 'Enter your first name',
    helpText: '',
    options: [],
    order: 1,
  },
  {
    id: 'lastName',
    type: 'text',
    label: 'Last Name',
    required: true,
    placeholder: 'Enter your last name',
    helpText: '',
    options: [],
    order: 2,
  },
  {
    id: 'email',
    type: 'text',
    label: 'Email',
    required: true,
    placeholder: 'your@email.com',
    helpText: '',
    options: [],
    order: 3,
  },
  {
    id: 'phone',
    type: 'text',
    label: 'Phone Number',
    required: true,
    placeholder: '+27 XX XXX XXXX',
    helpText: '',
    options: [],
    order: 4,
  },
  {
    id: 'reasonForVisit',
    type: 'textarea',
    label: 'Reason for Visit',
    required: true,
    placeholder: 'Briefly describe your symptoms or reason for booking',
    helpText: '',
    options: [],
    order: 5,
  },
];

export const DEFAULT_PRE_CONSULTATION_FORM_FIELDS: BookingFormField[] = [
  {
    id: 'hasMedicalAid',
    type: 'yesno',
    label: 'Do you have Medical Aid?',
    required: true,
    placeholder: '',
    helpText: '',
    options: [],
    order: 1,
  },
  {
    id: 'medicalAidScheme',
    type: 'dropdown',
    label: 'Medical Aid Scheme',
    required: false,
    placeholder: 'Select your scheme',
    helpText: '',
    options: [
      'Discovery Health',
      'Momentum Health',
      'Bonitas',
      'Medihelp',
      'Fedhealth',
      'GEMS',
      'Profmed',
      'Other',
    ],
    order: 2,
  },
  {
    id: 'memberNumber',
    type: 'text',
    label: 'Member Number',
    required: false,
    placeholder: 'Your medical aid member number',
    helpText: '',
    options: [],
    order: 3,
  },
  {
    id: 'currentMedications',
    type: 'textarea',
    label: 'Current Medications',
    required: false,
    placeholder: 'List any medications you are currently taking',
    helpText: '',
    options: [],
    order: 4,
  },
  {
    id: 'allergies',
    type: 'textarea',
    label: 'Allergies',
    required: false,
    placeholder: 'List any known allergies',
    helpText: '',
    options: [],
    order: 5,
  },
  {
    id: 'recentSymptoms',
    type: 'textarea',
    label: 'Recent Symptoms',
    required: false,
    placeholder: 'Describe any recent symptoms',
    helpText: '',
    options: [],
    order: 6,
  },
  {
    id: 'consent',
    type: 'checkbox',
    label:
      'I consent to this practice collecting my information for appointment booking and pre-consultation purposes.',
    required: true,
    placeholder: '',
    helpText: '',
    options: [],
    order: 7,
  },
];

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'item';
}

export function isUrlSafeSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function normalizeTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 5);
}

export function generateConfirmationNumber(typeName: string): string {
  const prefix = typeName.replace(/[^A-Za-z]/g, '').substring(0, 2).toUpperCase() || 'PX';
  const year = new Date().getFullYear();
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${suffix}`;
}

export function calculateDepositAmount(type: AppointmentType): number {
  if (!type.requiresDeposit) return 0;
  if (type.depositType === 'percentage') {
    return Math.round((type.price * type.depositAmount) / 100 * 100) / 100;
  }
  return type.depositAmount;
}

export function answerToString(value: string | boolean | string[] | undefined): string {
  if (value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return value;
}

export function extractPatientFields(answers: FormAnswers): {
  displayName: string;
  email: string;
  phone: string;
} {
  const firstName = answerToString(answers.firstName).trim();
  const lastName = answerToString(answers.lastName).trim();
  const combined = `${firstName} ${lastName}`.trim();
  return {
    displayName: combined || 'Patient',
    email: answerToString(answers.email).trim(),
    phone: answerToString(answers.phone).trim(),
  };
}

export function missingRequiredFields(
  fields: BookingFormField[],
  answers: FormAnswers
): string[] {
  return fields
    .filter((field) => field.required)
    .filter((field) => {
      const value = answers[field.id];
      if (field.type === 'checkbox') return value !== true;
      if (typeof value === 'boolean') return false;
      if (Array.isArray(value)) return value.length === 0;
      return !value || String(value).trim() === '';
    })
    .map((field) => field.label);
}

export function collectAnswerText(answers: FormAnswers): string {
  return Object.values(answers)
    .map((value) => answerToString(value))
    .join(' ');
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  breakStart: string | null,
  breakEnd: string | null,
  intervalMinutes: number,
  occupiedTimes: string[]
): string[] {
  const start = timeToMinutes(normalizeTime(startTime));
  const end = timeToMinutes(normalizeTime(endTime));
  if (start === null || end === null || end <= start) return [];

  const breakStartMinutes = timeToMinutes(normalizeTime(breakStart));
  const breakEndMinutes = timeToMinutes(normalizeTime(breakEnd));
  const occupied = new Set(occupiedTimes.map(normalizeTime));
  const slots: string[] = [];
  let current = start;

  while (current < end) {
    if (
      breakStartMinutes !== null &&
      breakEndMinutes !== null &&
      current >= breakStartMinutes &&
      current < breakEndMinutes
    ) {
      current = breakEndMinutes;
      continue;
    }

    const time = minutesToTime(current);
    if (!occupied.has(time)) {
      slots.push(time);
    }
    current += intervalMinutes;
  }

  return slots;
}

function timeToMinutes(value: string): number | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function publicAppointmentsPath(practiceSlug: string): string {
  return `/${practiceSlug}/appointments`;
}

export function publicBookingPath(practiceSlug: string, appointmentSlug: string): string {
  return `/${practiceSlug}/appointments/${appointmentSlug}`;
}

export function publicUrl(path: string): string {
  return `${window.location.origin}${path}`;
}
