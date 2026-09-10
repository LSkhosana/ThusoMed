import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  AvailabilitySettings,
  BookingFormField,
  FormAnswers,
  OperatingHours,
  PaymentStatus,
  PracticeProfile,
} from '../types';
import { normalizeTime } from './booking';
import { supabase } from './supabase';

type PracticeRow = {
  id: string;
  slug: string;
  practice_name: string;
  practitioner_name: string;
  specialty: string | null;
  hpcsa_number: string | null;
  description: string | null;
  services: string[] | null;
  medical_aids: string[] | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  operating_hours: OperatingHours | null;
  emergency_disclaimer: string | null;
  profile_image_url: string | null;
  branding_color: string | null;
  created_at: string;
  updated_at: string;
};

type AvailabilityRow = {
  id: string;
  practice_id: string;
  available_days: string[] | null;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  slot_interval_minutes: number;
  blocked_dates: string[] | null;
  updated_at: string;
};

type AppointmentTypeRow = {
  id: string;
  practice_id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  price: number | string;
  requires_deposit: boolean;
  deposit_amount: number | string;
  deposit_type: 'fixed' | 'percentage';
  max_bookings_per_day: number;
  is_active: boolean;
  is_published: boolean;
  booking_form_fields: BookingFormField[] | null;
  pre_consultation_form_fields: BookingFormField[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type AppointmentRow = {
  id: string;
  practice_id: string;
  appointment_type_id: string;
  appointment_date: string;
  appointment_time: string;
  booking_answers: FormAnswers | null;
  pre_consultation_answers: FormAnswers | null;
  patient_display_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_amount: number | string;
  confirmation_number: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const defaultOperatingHours: OperatingHours = {
  weekdays: { start: '08:00', end: '17:00' },
  saturday: { start: '08:00', end: '12:00', enabled: false },
  sunday: { start: '00:00', end: '00:00', enabled: false },
};

function mapPractice(row: PracticeRow): PracticeProfile {
  return {
    id: row.id,
    slug: row.slug,
    practiceName: row.practice_name,
    practitionerName: row.practitioner_name,
    specialty: row.specialty || '',
    hpcsaNumber: row.hpcsa_number || '',
    description: row.description || '',
    services: row.services || [],
    medicalAids: row.medical_aids || [],
    address: row.address || '',
    city: row.city || '',
    province: row.province || '',
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || '',
    operatingHours: row.operating_hours || defaultOperatingHours,
    emergencyDisclaimer: row.emergency_disclaimer || '',
    profileImageUrl: row.profile_image_url,
    brandingColor: row.branding_color || '#0284C7',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAvailability(row: AvailabilityRow): AvailabilitySettings {
  return {
    id: row.id,
    practiceId: row.practice_id,
    availableDays: row.available_days || [],
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    breakStart: row.break_start ? normalizeTime(row.break_start) : null,
    breakEnd: row.break_end ? normalizeTime(row.break_end) : null,
    slotIntervalMinutes: row.slot_interval_minutes,
    blockedDates: (row.blocked_dates || []).map((date) => date.slice(0, 10)),
    updatedAt: row.updated_at,
  };
}

function mapAppointmentType(row: AppointmentTypeRow): AppointmentType {
  return {
    id: row.id,
    practiceId: row.practice_id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    requiresDeposit: row.requires_deposit,
    depositAmount: Number(row.deposit_amount),
    depositType: row.deposit_type,
    maxBookingsPerDay: row.max_bookings_per_day,
    isActive: row.is_active,
    isPublished: row.is_published,
    bookingFormFields: row.booking_form_fields || [],
    preConsultationFormFields: row.pre_consultation_form_fields || [],
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    practiceId: row.practice_id,
    appointmentTypeId: row.appointment_type_id,
    appointmentDate: row.appointment_date.slice(0, 10),
    appointmentTime: normalizeTime(row.appointment_time),
    bookingAnswers: row.booking_answers || {},
    preConsultationAnswers: row.pre_consultation_answers || {},
    patientDisplayName: row.patient_display_name || 'Patient',
    patientEmail: row.patient_email || '',
    patientPhone: row.patient_phone || '',
    status: row.status,
    paymentStatus: row.payment_status,
    paymentAmount: Number(row.payment_amount),
    confirmationNumber: row.confirmation_number,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export async function getPractice(): Promise<PracticeProfile> {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .limit(1)
    .single();
  throwIfError(error);
  return mapPractice(data as PracticeRow);
}

export async function getPracticeBySlug(slug: string): Promise<PracticeProfile | null> {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  throwIfError(error);
  return data ? mapPractice(data as PracticeRow) : null;
}

export async function updatePractice(
  id: string,
  profile: PracticeProfile
): Promise<PracticeProfile> {
  const { data, error } = await supabase
    .from('practices')
    .update({
      slug: profile.slug,
      practice_name: profile.practiceName,
      practitioner_name: profile.practitionerName,
      specialty: profile.specialty,
      hpcsa_number: profile.hpcsaNumber,
      description: profile.description,
      services: profile.services,
      medical_aids: profile.medicalAids,
      address: profile.address,
      city: profile.city,
      province: profile.province,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
      operating_hours: profile.operatingHours,
      emergency_disclaimer: profile.emergencyDisclaimer,
      profile_image_url: profile.profileImageUrl,
      branding_color: profile.brandingColor,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  throwIfError(error);
  return mapPractice(data as PracticeRow);
}

export async function getAvailability(practiceId: string): Promise<AvailabilitySettings> {
  const { data, error } = await supabase
    .from('availability_settings')
    .select('*')
    .eq('practice_id', practiceId)
    .single();
  throwIfError(error);
  return mapAvailability(data as AvailabilityRow);
}

export async function updateAvailability(
  id: string,
  settings: AvailabilitySettings
): Promise<AvailabilitySettings> {
  const { data, error } = await supabase
    .from('availability_settings')
    .update({
      available_days: settings.availableDays,
      start_time: settings.startTime,
      end_time: settings.endTime,
      break_start: settings.breakStart,
      break_end: settings.breakEnd,
      slot_interval_minutes: settings.slotIntervalMinutes,
      blocked_dates: settings.blockedDates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  throwIfError(error);
  return mapAvailability(data as AvailabilityRow);
}

export async function listAppointmentTypes(practiceId: string): Promise<AppointmentType[]> {
  const { data, error } = await supabase
    .from('appointment_types')
    .select('*')
    .eq('practice_id', practiceId)
    .order('created_at', { ascending: true });
  throwIfError(error);
  return ((data || []) as AppointmentTypeRow[]).map(mapAppointmentType);
}

export async function listPublishedAppointmentTypes(
  practiceId: string
): Promise<AppointmentType[]> {
  const { data, error } = await supabase
    .from('appointment_types')
    .select('*')
    .eq('practice_id', practiceId)
    .eq('is_active', true)
    .eq('is_published', true)
    .order('name', { ascending: true });
  throwIfError(error);
  return ((data || []) as AppointmentTypeRow[]).map(mapAppointmentType);
}

export async function getPublishedAppointmentType(
  practiceId: string,
  slug: string
): Promise<AppointmentType | null> {
  const { data, error } = await supabase
    .from('appointment_types')
    .select('*')
    .eq('practice_id', practiceId)
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_published', true)
    .maybeSingle();
  throwIfError(error);
  return data ? mapAppointmentType(data as AppointmentTypeRow) : null;
}

export async function createAppointmentType(
  practiceId: string,
  type: Omit<
    AppointmentType,
    'id' | 'practiceId' | 'createdAt' | 'updatedAt' | 'publishedAt'
  >
): Promise<AppointmentType> {
  const { data, error } = await supabase
    .from('appointment_types')
    .insert({
      practice_id: practiceId,
      name: type.name,
      slug: type.slug,
      description: type.description,
      duration_minutes: type.durationMinutes,
      price: type.price,
      requires_deposit: type.requiresDeposit,
      deposit_amount: type.depositAmount,
      deposit_type: type.depositType,
      max_bookings_per_day: type.maxBookingsPerDay,
      is_active: type.isActive,
      is_published: type.isPublished,
      booking_form_fields: type.bookingFormFields,
      pre_consultation_form_fields: type.preConsultationFormFields,
    })
    .select('*')
    .single();
  throwIfError(error);
  return mapAppointmentType(data as AppointmentTypeRow);
}

export async function updateAppointmentType(
  id: string,
  patch: Partial<AppointmentType>
): Promise<AppointmentType> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.slug !== undefined) payload.slug = patch.slug;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.durationMinutes !== undefined) payload.duration_minutes = patch.durationMinutes;
  if (patch.price !== undefined) payload.price = patch.price;
  if (patch.requiresDeposit !== undefined) payload.requires_deposit = patch.requiresDeposit;
  if (patch.depositAmount !== undefined) payload.deposit_amount = patch.depositAmount;
  if (patch.depositType !== undefined) payload.deposit_type = patch.depositType;
  if (patch.maxBookingsPerDay !== undefined) payload.max_bookings_per_day = patch.maxBookingsPerDay;
  if (patch.isActive !== undefined) payload.is_active = patch.isActive;
  if (patch.isPublished !== undefined) payload.is_published = patch.isPublished;
  if (patch.bookingFormFields !== undefined) payload.booking_form_fields = patch.bookingFormFields;
  if (patch.preConsultationFormFields !== undefined) {
    payload.pre_consultation_form_fields = patch.preConsultationFormFields;
  }
  if (patch.publishedAt !== undefined) payload.published_at = patch.publishedAt;

  const { data, error } = await supabase
    .from('appointment_types')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  throwIfError(error);
  return mapAppointmentType(data as AppointmentTypeRow);
}

export async function deleteAppointmentType(id: string): Promise<void> {
  const { error } = await supabase.from('appointment_types').delete().eq('id', id);
  throwIfError(error);
}

export async function listAppointments(practiceId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('practice_id', practiceId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });
  throwIfError(error);
  return ((data || []) as AppointmentRow[]).map(mapAppointment);
}

export async function isSlotTaken(
  date: string,
  time: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from('appointments')
    .select('id, appointment_time, status')
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;
  throwIfError(error);
  const normalized = normalizeTime(time);
  return ((data || []) as { appointment_time: string }[]).some(
    (row) => normalizeTime(row.appointment_time) === normalized
  );
}

export async function getOccupiedTimes(date: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time, status')
    .eq('appointment_date', date)
    .neq('status', 'cancelled');
  throwIfError(error);
  return ((data || []) as { appointment_time: string }[]).map((row) =>
    normalizeTime(row.appointment_time)
  );
}

export async function countTypeBookingsForDate(
  appointmentTypeId: string,
  date: string
): Promise<number> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('appointment_type_id', appointmentTypeId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled');
  throwIfError(error);
  return (data || []).length;
}

export async function createAppointment(input: {
  practiceId: string;
  appointmentTypeId: string;
  appointmentDate: string;
  appointmentTime: string;
  bookingAnswers: FormAnswers;
  preConsultationAnswers: FormAnswers;
  patientDisplayName: string;
  patientEmail: string;
  patientPhone: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  confirmationNumber: string;
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      practice_id: input.practiceId,
      appointment_type_id: input.appointmentTypeId,
      appointment_date: input.appointmentDate,
      appointment_time: input.appointmentTime,
      booking_answers: input.bookingAnswers,
      pre_consultation_answers: input.preConsultationAnswers,
      patient_display_name: input.patientDisplayName,
      patient_email: input.patientEmail,
      patient_phone: input.patientPhone,
      status: 'pending',
      payment_status: input.paymentStatus,
      payment_amount: input.paymentAmount,
      confirmation_number: input.confirmationNumber,
      notes: '',
    })
    .select('*')
    .single();
  throwIfError(error);
  return mapAppointment(data as AppointmentRow);
}

export async function updateAppointment(
  id: string,
  patch: Partial<
    Pick<Appointment, 'status' | 'notes' | 'paymentStatus'>
  >
): Promise<Appointment> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.notes !== undefined) payload.notes = patch.notes;
  if (patch.paymentStatus !== undefined) payload.payment_status = patch.paymentStatus;

  const { data, error } = await supabase
    .from('appointments')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  throwIfError(error);
  return mapAppointment(data as AppointmentRow);
}
