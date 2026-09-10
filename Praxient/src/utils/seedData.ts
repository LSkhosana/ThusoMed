import {
  PracticeAccount,
  PracticeProfile,
  AppointmentType,
  ScheduleSettings,
  BookingForm,
  Appointment,
  Settings,
} from '../types';
import { storage } from './storage';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const seedDemoData = () => {
  // Check if already seeded
  const existingAccount = storage.getAccount();
  if (existingAccount) return;

  // Seed account
  const account: PracticeAccount = {
    id: generateId(),
    practiceName: 'Thuso Family Medical Practice',
    doctorName: 'Dr. Naledi Mokoena',
    email: 'reception@thusodemo.co.za',
    phone: '+27 11 123 4567',
    specialty: 'General Practitioner',
    password: 'demo123',
    createdAt: new Date().toISOString(),
  };
  storage.setAccount(account);

  // Seed profile
  const profile: PracticeProfile = {
    id: generateId(),
    practiceName: 'Thuso Family Medical Practice',
    practitionerName: 'Dr. Naledi Mokoena',
    specialty: 'General Practitioner',
    hpcsaNumber: 'MP0123456',
    description:
      'Thuso Family Medical Practice provides comprehensive primary healthcare services for individuals and families in Johannesburg. We focus on preventive care, chronic disease management, and patient education.',
    services: [
      'General Consultations',
      'Chronic Disease Management',
      'Child Health',
      'Women\'s Health',
      'Minor Procedures',
      'Travel Vaccinations',
      'Health Screenings',
    ],
    medicalAids: [
      'Discovery Health',
      'Momentum Health',
      'Bonitas',
      'Medihelp',
      'Fedhealth',
      'GEMS',
      'Profmed',
    ],
    address: '123 Main Street, Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    phone: '+27 11 123 4567',
    email: 'reception@thusodemo.co.za',
    website: 'www.thusodemo.co.za',
    operatingHours: {
      weekdays: { start: '08:00', end: '17:00' },
      saturday: { start: '08:00', end: '12:00', enabled: true },
      sunday: { start: '00:00', end: '00:00', enabled: false },
    },
    emergencyDisclaimer:
      'For medical emergencies, please dial 10177 or visit your nearest emergency room. Do not use online booking for urgent care needs.',
    profileImage: null,
  };
  storage.setProfile(profile);

  // Seed appointment types
  const appointmentTypes: AppointmentType[] = [
    {
      id: generateId(),
      name: 'General Consultation',
      description: 'Standard consultation for new or ongoing health concerns',
      durationMinutes: 30,
      price: 850,
      requiresDeposit: false,
      depositAmount: 0,
      depositType: 'percentage',
      maxBookingsPerDay: 12,
      isActive: true,
    },
    {
      id: generateId(),
      name: 'Follow-up Consultation',
      description: 'Follow-up visit for existing patients',
      durationMinutes: 20,
      price: 650,
      requiresDeposit: false,
      depositAmount: 0,
      depositType: 'percentage',
      maxBookingsPerDay: 8,
      isActive: true,
    },
    {
      id: generateId(),
      name: 'Specialist Consultation',
      description: 'Extended consultation requiring detailed examination',
      durationMinutes: 45,
      price: 1200,
      requiresDeposit: true,
      depositAmount: 50,
      depositType: 'percentage',
      maxBookingsPerDay: 6,
      isActive: true,
    },
    {
      id: generateId(),
      name: 'Telehealth Consultation',
      description: 'Video consultation for remote patients',
      durationMinutes: 30,
      price: 700,
      requiresDeposit: false,
      depositAmount: 0,
      depositType: 'percentage',
      maxBookingsPerDay: 8,
      isActive: true,
    },
  ];
  storage.setAppointmentTypes(appointmentTypes);

  // Seed schedule settings
  const scheduleSettings: ScheduleSettings = {
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    startTime: '08:00',
    endTime: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    slotInterval: 15,
    blockedDates: [],
  };
  storage.setScheduleSettings(scheduleSettings);

  // Seed booking form
  const bookingForm: BookingForm = {
    id: generateId(),
    appointmentTypeId: appointmentTypes[0].id,
    name: 'Standard Patient Registration',
    fields: [
      { id: 'firstName', type: 'text', label: 'First Name', required: true, placeholder: 'Enter your first name', helpText: '', order: 1 },
      { id: 'lastName', type: 'text', label: 'Last Name', required: true, placeholder: 'Enter your last name', helpText: '', order: 2 },
      { id: 'email', type: 'text', label: 'Email', required: true, placeholder: 'your@email.com', helpText: '', order: 3 },
      { id: 'phone', type: 'text', label: 'Phone Number', required: true, placeholder: '+27 XX XXX XXXX', helpText: '', order: 4 },
      { id: 'reasonForVisit', type: 'textarea', label: 'Reason for Visit', required: true, placeholder: 'Briefly describe your symptoms or reason for booking', helpText: '', order: 5 },
      { id: 'hasMedicalAid', type: 'yesno', label: 'Do you have Medical Aid?', required: true, placeholder: '', helpText: '', order: 6 },
      { id: 'medicalAidScheme', type: 'dropdown', label: 'Medical Aid Scheme', required: false, placeholder: 'Select your scheme', helpText: '', options: ['Discovery Health', 'Momentum Health', 'Bonitas', 'Medihelp', 'Fedhealth', 'GEMS', 'Profmed', 'Other'], order: 7 },
      { id: 'memberNumber', type: 'text', label: 'Member Number', required: false, placeholder: 'Your medical aid member number', helpText: '', order: 8 },
      { id: 'currentMedications', type: 'textarea', label: 'Current Medications', required: false, placeholder: 'List any medications you are currently taking', helpText: '', order: 9 },
      { id: 'allergies', type: 'textarea', label: 'Allergies', required: false, placeholder: 'List any known allergies', helpText: '', order: 10 },
      { id: 'recentSymptoms', type: 'textarea', label: 'Recent Symptoms', required: false, placeholder: 'Describe any recent symptoms', helpText: '', order: 11 },
      { id: 'consent', type: 'checkbox', label: 'I consent to this practice collecting my information for appointment booking and pre-consultation purposes.', required: true, placeholder: '', helpText: '', order: 12 },
    ],
    isActive: true,
  };
  storage.setBookingForms([bookingForm]);

  // Seed appointments
  const today = new Date();
  const appointments: Appointment[] = [
    {
      id: generateId(),
      appointmentTypeId: appointmentTypes[0].id,
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:30',
      patientFirstName: 'Thabo',
      patientLastName: 'Molefe',
      patientEmail: 'thabo.molefe@email.co.za',
      patientPhone: '+27 82 123 4567',
      reasonForVisit: 'Annual checkup and blood pressure monitoring',
      hasMedicalAid: true,
      medicalAidScheme: 'Discovery Health',
      memberNumber: 'DH-789456',
      currentMedications: 'Amlodipine 5mg daily',
      allergies: 'Penicillin',
      recentSymptoms: 'Occasional headaches in the morning',
      formAnswers: {},
      status: 'pending',
      paymentStatus: 'not_required',
      isPriority: false,
      notes: '',
      confirmationNumber: 'TM-2026-001',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      appointmentTypeId: appointmentTypes[1].id,
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:00',
      patientFirstName: 'Lerato',
      patientLastName: 'Ndaba',
      patientEmail: 'lerato.ndaba@email.co.za',
      patientPhone: '+27 83 234 5678',
      reasonForVisit: 'Follow-up for diabetes management',
      hasMedicalAid: true,
      medicalAidScheme: 'Bonitas',
      memberNumber: 'BON-456123',
      currentMedications: 'Metformin 500mg twice daily',
      allergies: 'None known',
      recentSymptoms: 'Blood glucose readings stable',
      formAnswers: {},
      status: 'confirmed',
      paymentStatus: 'not_required',
      isPriority: false,
      notes: 'Patient has been managing well. Continue current treatment.',
      confirmationNumber: 'LN-2026-002',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      appointmentTypeId: appointmentTypes[2].id,
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      patientFirstName: 'Johan',
      patientLastName: 'Botha',
      patientEmail: 'johan.botha@email.co.za',
      patientPhone: '+27 84 345 6789',
      reasonForVisit: 'Severe lower back pain radiating to legs, affecting sleep and mobility',
      hasMedicalAid: true,
      medicalAidScheme: 'Momentum Health',
      memberNumber: 'MH-321654',
      currentMedications: 'Ibuprofen 400mg as needed',
      allergies: 'Sulfa drugs',
      recentSymptoms: 'Severe lower back pain, numbness in left leg, difficulty walking',
      formAnswers: {},
      status: 'pending',
      paymentStatus: 'pending',
      isPriority: true,
      notes: 'Priority review - symptoms indicate possible sciatica or disc issue',
      confirmationNumber: 'JB-2026-003',
      createdAt: new Date().toISOString(),
    },
  ];
  storage.setAppointments(appointments);

  // Seed settings
  const settings: Settings = {
    brandingColor: '#0284C7',
    smsRemindersEnabled: true,
    emailConfirmationsEnabled: true,
    paymentRequired: false,
    medicalAidAccepted: true,
    notifications: {
      newBooking: true,
      cancellation: true,
      reminder: true,
    },
  };
  storage.setSettings(settings);
};
