import {
  PracticeAccount,
  PracticeProfile,
  AppointmentType,
  AvailabilitySettings,
  BookingForm,
  Appointment,
  Settings,
} from '../types';

const KEYS = {
  ACCOUNT: 'thusomed_demo_account',
  PROFILE: 'thusomed_practice_profile',
  APPOINTMENT_TYPES: 'thusomed_appointment_types',
  SCHEDULE: 'thusomed_schedule_settings',
  BOOKING_FORM: 'thusomed_booking_form',
  APPOINTMENTS: 'thusomed_appointments',
  SETTINGS: 'thusomed_settings',
};

export const storage = {
  getAccount: (): PracticeAccount | null => {
    const data = localStorage.getItem(KEYS.ACCOUNT);
    return data ? JSON.parse(data) : null;
  },

  setAccount: (account: PracticeAccount): void => {
    localStorage.setItem(KEYS.ACCOUNT, JSON.stringify(account));
  },

  clearAccount: (): void => {
    localStorage.removeItem(KEYS.ACCOUNT);
  },

  getProfile: (): PracticeProfile | null => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  setProfile: (profile: PracticeProfile): void => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getAppointmentTypes: (): AppointmentType[] => {
    const data = localStorage.getItem(KEYS.APPOINTMENT_TYPES);
    return data ? JSON.parse(data) : [];
  },

  setAppointmentTypes: (types: AppointmentType[]): void => {
    localStorage.setItem(KEYS.APPOINTMENT_TYPES, JSON.stringify(types));
  },

  getScheduleSettings: (): AvailabilitySettings | null => {
    const data = localStorage.getItem(KEYS.SCHEDULE);
    return data ? JSON.parse(data) : null;
  },

  setScheduleSettings: (settings: AvailabilitySettings): void => {
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(settings));
  },

  getBookingForms: (): BookingForm[] => {
    const data = localStorage.getItem(KEYS.BOOKING_FORM);
    return data ? JSON.parse(data) : [];
  },

  setBookingForms: (forms: BookingForm[]): void => {
    localStorage.setItem(KEYS.BOOKING_FORM, JSON.stringify(forms));
  },

  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  },

  setAppointments: (appointments: Appointment[]): void => {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  getSettings: (): Settings | null => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  setSettings: (settings: Settings): void => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  clearAll: (): void => {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
