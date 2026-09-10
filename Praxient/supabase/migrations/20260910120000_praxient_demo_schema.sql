-- Praxient stakeholder demo schema.
-- Demonstration only. Do not use this schema, seed data, or access model in production.

create table if not exists public.practices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  practice_name text not null,
  practitioner_name text not null,
  specialty text,
  hpcsa_number text,
  description text,
  services text[] not null default '{}',
  medical_aids text[] not null default '{}',
  address text,
  city text,
  province text,
  phone text,
  email text,
  website text,
  operating_hours jsonb not null default '{}'::jsonb,
  emergency_disclaimer text,
  profile_image_url text,
  branding_color text default '#0284C7',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_settings (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null unique references public.practices(id) on delete cascade,
  available_days text[] not null default '{}',
  start_time time not null,
  end_time time not null,
  break_start time,
  break_end time,
  slot_interval_minutes integer not null default 15,
  blocked_dates date[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_types (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  duration_minutes integer not null default 30,
  price numeric(10,2) not null default 0,
  requires_deposit boolean not null default false,
  deposit_amount numeric(10,2) not null default 0,
  deposit_type text not null default 'fixed' check (deposit_type in ('fixed','percentage')),
  max_bookings_per_day integer not null default 10,
  is_active boolean not null default true,
  is_published boolean not null default false,
  booking_form_fields jsonb not null default '[]'::jsonb,
  pre_consultation_form_fields jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (practice_id, slug)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  appointment_type_id uuid not null references public.appointment_types(id) on delete restrict,
  appointment_date date not null,
  appointment_time time not null,
  booking_answers jsonb not null default '{}'::jsonb,
  pre_consultation_answers jsonb not null default '{}'::jsonb,
  patient_display_name text,
  patient_email text,
  patient_phone text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  payment_status text not null default 'not_required' check (payment_status in ('not_required','pending','paid','failed')),
  payment_amount numeric(10,2) not null default 0,
  confirmation_number text not null unique,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_date_time
  on public.appointments (appointment_date, appointment_time);

create index if not exists idx_appointments_appointment_type_id
  on public.appointments (appointment_type_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists practices_set_updated_at on public.practices;
create trigger practices_set_updated_at
  before update on public.practices
  for each row execute procedure public.set_updated_at();

drop trigger if exists availability_settings_set_updated_at on public.availability_settings;
create trigger availability_settings_set_updated_at
  before update on public.availability_settings
  for each row execute procedure public.set_updated_at();

drop trigger if exists appointment_types_set_updated_at on public.appointment_types;
create trigger appointment_types_set_updated_at
  before update on public.appointment_types
  for each row execute procedure public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- TEMPORARY DEMO RLS POLICIES
-- DEMO ONLY and must not ship to production.
-- This demo has no auth, so anon is granted open table access for the
-- current Praxient stakeholder walkthrough.
-- ---------------------------------------------------------------------------

alter table public.practices enable row level security;
alter table public.availability_settings enable row level security;
alter table public.appointment_types enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "TEMP DEMO: anon select practices" on public.practices;
create policy "TEMP DEMO: anon select practices"
  on public.practices
  for select
  to anon
  using (true);

drop policy if exists "TEMP DEMO: anon update practices" on public.practices;
create policy "TEMP DEMO: anon update practices"
  on public.practices
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists "TEMP DEMO: anon select availability_settings" on public.availability_settings;
create policy "TEMP DEMO: anon select availability_settings"
  on public.availability_settings
  for select
  to anon
  using (true);

drop policy if exists "TEMP DEMO: anon update availability_settings" on public.availability_settings;
create policy "TEMP DEMO: anon update availability_settings"
  on public.availability_settings
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists "TEMP DEMO: anon select appointment_types" on public.appointment_types;
create policy "TEMP DEMO: anon select appointment_types"
  on public.appointment_types
  for select
  to anon
  using (true);

drop policy if exists "TEMP DEMO: anon insert appointment_types" on public.appointment_types;
create policy "TEMP DEMO: anon insert appointment_types"
  on public.appointment_types
  for insert
  to anon
  with check (true);

drop policy if exists "TEMP DEMO: anon update appointment_types" on public.appointment_types;
create policy "TEMP DEMO: anon update appointment_types"
  on public.appointment_types
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists "TEMP DEMO: anon delete appointment_types" on public.appointment_types;
create policy "TEMP DEMO: anon delete appointment_types"
  on public.appointment_types
  for delete
  to anon
  using (true);

drop policy if exists "TEMP DEMO: anon select appointments" on public.appointments;
create policy "TEMP DEMO: anon select appointments"
  on public.appointments
  for select
  to anon
  using (true);

drop policy if exists "TEMP DEMO: anon insert appointments" on public.appointments;
create policy "TEMP DEMO: anon insert appointments"
  on public.appointments
  for insert
  to anon
  with check (true);

drop policy if exists "TEMP DEMO: anon update appointments" on public.appointments;
create policy "TEMP DEMO: anon update appointments"
  on public.appointments
  for update
  to anon
  using (true)
  with check (true);

-- DEMO ONLY: minimum table privileges for the unauthenticated frontend key.
-- These grants must not ship to production.
grant usage on schema public to anon;
grant select, update on table public.practices to anon;
grant select, update on table public.availability_settings to anon;
grant select, insert, update, delete on table public.appointment_types to anon;
grant select, insert, update on table public.appointments to anon;

-- Seed the current demo practice, availability, appointment types, and sample bookings.
insert into public.practices (
  id,
  slug,
  practice_name,
  practitioner_name,
  specialty,
  hpcsa_number,
  description,
  services,
  medical_aids,
  address,
  city,
  province,
  phone,
  email,
  website,
  operating_hours,
  emergency_disclaimer,
  profile_image_url,
  branding_color
) values (
  '11111111-1111-4111-8111-111111111111',
  'dr-mokoena',
  'Thuso Family Medical Practice',
  'Dr. Naledi Mokoena',
  'General Practitioner',
  'MP0123456',
  'Thuso Family Medical Practice provides comprehensive primary healthcare services for individuals and families in Johannesburg. We focus on preventive care, chronic disease management, and patient education.',
  array[
    'General Consultations',
    'Chronic Disease Management',
    'Child Health',
    'Women''s Health',
    'Minor Procedures',
    'Travel Vaccinations',
    'Health Screenings'
  ],
  array[
    'Discovery Health',
    'Momentum Health',
    'Bonitas',
    'Medihelp',
    'Fedhealth',
    'GEMS',
    'Profmed'
  ],
  '123 Main Street, Sandton',
  'Johannesburg',
  'Gauteng',
  '+27 11 123 4567',
  'reception@thusodemo.co.za',
  'www.thusodemo.co.za',
  '{
    "weekdays": {"start": "08:00", "end": "17:00"},
    "saturday": {"start": "08:00", "end": "12:00", "enabled": true},
    "sunday": {"start": "00:00", "end": "00:00", "enabled": false}
  }'::jsonb,
  'For medical emergencies, please dial 10177 or visit your nearest emergency room. Do not use online booking for urgent care needs.',
  null,
  '#0284C7'
)
on conflict (id) do nothing;

insert into public.availability_settings (
  id,
  practice_id,
  available_days,
  start_time,
  end_time,
  break_start,
  break_end,
  slot_interval_minutes,
  blocked_dates
) values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  array['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  '08:00',
  '17:00',
  '12:00',
  '13:00',
  15,
  '{}'::date[]
)
on conflict (id) do nothing;

insert into public.appointment_types (
  id,
  practice_id,
  name,
  slug,
  description,
  duration_minutes,
  price,
  requires_deposit,
  deposit_amount,
  deposit_type,
  max_bookings_per_day,
  is_active,
  is_published,
  booking_form_fields,
  pre_consultation_form_fields,
  published_at
) values
(
  '33333333-3333-4333-8333-333333333331',
  '11111111-1111-4111-8111-111111111111',
  'General Consultation',
  'general-consultation',
  'Standard consultation for new or ongoing health concerns',
  30,
  850,
  false,
  0,
  'percentage',
  12,
  true,
  true,
  '[
    {"id":"firstName","type":"text","label":"First Name","required":true,"placeholder":"Enter your first name","helpText":"","options":[],"order":1},
    {"id":"lastName","type":"text","label":"Last Name","required":true,"placeholder":"Enter your last name","helpText":"","options":[],"order":2},
    {"id":"email","type":"text","label":"Email","required":true,"placeholder":"your@email.com","helpText":"","options":[],"order":3},
    {"id":"phone","type":"text","label":"Phone Number","required":true,"placeholder":"+27 XX XXX XXXX","helpText":"","options":[],"order":4},
    {"id":"reasonForVisit","type":"textarea","label":"Reason for Visit","required":true,"placeholder":"Briefly describe your symptoms or reason for booking","helpText":"","options":[],"order":5}
  ]'::jsonb,
  '[
    {"id":"hasMedicalAid","type":"yesno","label":"Do you have Medical Aid?","required":true,"placeholder":"","helpText":"","options":[],"order":1},
    {"id":"medicalAidScheme","type":"dropdown","label":"Medical Aid Scheme","required":false,"placeholder":"Select your scheme","helpText":"","options":["Discovery Health","Momentum Health","Bonitas","Medihelp","Fedhealth","GEMS","Profmed","Other"],"order":2},
    {"id":"memberNumber","type":"text","label":"Member Number","required":false,"placeholder":"Your medical aid member number","helpText":"","options":[],"order":3},
    {"id":"currentMedications","type":"textarea","label":"Current Medications","required":false,"placeholder":"List any medications you are currently taking","helpText":"","options":[],"order":4},
    {"id":"allergies","type":"textarea","label":"Allergies","required":false,"placeholder":"List any known allergies","helpText":"","options":[],"order":5},
    {"id":"recentSymptoms","type":"textarea","label":"Recent Symptoms","required":false,"placeholder":"Describe any recent symptoms","helpText":"","options":[],"order":6},
    {"id":"consent","type":"checkbox","label":"I consent to this practice collecting my information for appointment booking and pre-consultation purposes.","required":true,"placeholder":"","helpText":"","options":[],"order":7}
  ]'::jsonb,
  now()
),
(
  '33333333-3333-4333-8333-333333333332',
  '11111111-1111-4111-8111-111111111111',
  'Follow-up Consultation',
  'follow-up-consultation',
  'Follow-up visit for existing patients',
  20,
  650,
  false,
  0,
  'percentage',
  8,
  true,
  true,
  '[
    {"id":"firstName","type":"text","label":"First Name","required":true,"placeholder":"Enter your first name","helpText":"","options":[],"order":1},
    {"id":"lastName","type":"text","label":"Last Name","required":true,"placeholder":"Enter your last name","helpText":"","options":[],"order":2},
    {"id":"email","type":"text","label":"Email","required":true,"placeholder":"your@email.com","helpText":"","options":[],"order":3},
    {"id":"phone","type":"text","label":"Phone Number","required":true,"placeholder":"+27 XX XXX XXXX","helpText":"","options":[],"order":4},
    {"id":"reasonForVisit","type":"textarea","label":"Reason for Visit","required":true,"placeholder":"Briefly describe your symptoms or reason for booking","helpText":"","options":[],"order":5}
  ]'::jsonb,
  '[
    {"id":"hasMedicalAid","type":"yesno","label":"Do you have Medical Aid?","required":true,"placeholder":"","helpText":"","options":[],"order":1},
    {"id":"medicalAidScheme","type":"dropdown","label":"Medical Aid Scheme","required":false,"placeholder":"Select your scheme","helpText":"","options":["Discovery Health","Momentum Health","Bonitas","Medihelp","Fedhealth","GEMS","Profmed","Other"],"order":2},
    {"id":"memberNumber","type":"text","label":"Member Number","required":false,"placeholder":"Your medical aid member number","helpText":"","options":[],"order":3},
    {"id":"currentMedications","type":"textarea","label":"Current Medications","required":false,"placeholder":"List any medications you are currently taking","helpText":"","options":[],"order":4},
    {"id":"allergies","type":"textarea","label":"Allergies","required":false,"placeholder":"List any known allergies","helpText":"","options":[],"order":5},
    {"id":"recentSymptoms","type":"textarea","label":"Recent Symptoms","required":false,"placeholder":"Describe any recent symptoms","helpText":"","options":[],"order":6},
    {"id":"consent","type":"checkbox","label":"I consent to this practice collecting my information for appointment booking and pre-consultation purposes.","required":true,"placeholder":"","helpText":"","options":[],"order":7}
  ]'::jsonb,
  now()
),
(
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'Specialist Consultation',
  'specialist-consultation',
  'Extended consultation requiring detailed examination',
  45,
  1200,
  true,
  50,
  'percentage',
  6,
  true,
  false,
  '[
    {"id":"firstName","type":"text","label":"First Name","required":true,"placeholder":"Enter your first name","helpText":"","options":[],"order":1},
    {"id":"lastName","type":"text","label":"Last Name","required":true,"placeholder":"Enter your last name","helpText":"","options":[],"order":2},
    {"id":"email","type":"text","label":"Email","required":true,"placeholder":"your@email.com","helpText":"","options":[],"order":3},
    {"id":"phone","type":"text","label":"Phone Number","required":true,"placeholder":"+27 XX XXX XXXX","helpText":"","options":[],"order":4},
    {"id":"reasonForVisit","type":"textarea","label":"Reason for Visit","required":true,"placeholder":"Briefly describe your symptoms or reason for booking","helpText":"","options":[],"order":5}
  ]'::jsonb,
  '[
    {"id":"hasMedicalAid","type":"yesno","label":"Do you have Medical Aid?","required":true,"placeholder":"","helpText":"","options":[],"order":1},
    {"id":"medicalAidScheme","type":"dropdown","label":"Medical Aid Scheme","required":false,"placeholder":"Select your scheme","helpText":"","options":["Discovery Health","Momentum Health","Bonitas","Medihelp","Fedhealth","GEMS","Profmed","Other"],"order":2},
    {"id":"memberNumber","type":"text","label":"Member Number","required":false,"placeholder":"Your medical aid member number","helpText":"","options":[],"order":3},
    {"id":"currentMedications","type":"textarea","label":"Current Medications","required":false,"placeholder":"List any medications you are currently taking","helpText":"","options":[],"order":4},
    {"id":"allergies","type":"textarea","label":"Allergies","required":false,"placeholder":"List any known allergies","helpText":"","options":[],"order":5},
    {"id":"recentSymptoms","type":"textarea","label":"Recent Symptoms","required":false,"placeholder":"Describe any recent symptoms","helpText":"","options":[],"order":6},
    {"id":"consent","type":"checkbox","label":"I consent to this practice collecting my information for appointment booking and pre-consultation purposes.","required":true,"placeholder":"","helpText":"","options":[],"order":7}
  ]'::jsonb,
  null
),
(
  '33333333-3333-4333-8333-333333333334',
  '11111111-1111-4111-8111-111111111111',
  'Telehealth Consultation',
  'telehealth-consultation',
  'Video consultation for remote patients',
  30,
  700,
  false,
  0,
  'percentage',
  8,
  true,
  true,
  '[
    {"id":"firstName","type":"text","label":"First Name","required":true,"placeholder":"Enter your first name","helpText":"","options":[],"order":1},
    {"id":"lastName","type":"text","label":"Last Name","required":true,"placeholder":"Enter your last name","helpText":"","options":[],"order":2},
    {"id":"email","type":"text","label":"Email","required":true,"placeholder":"your@email.com","helpText":"","options":[],"order":3},
    {"id":"phone","type":"text","label":"Phone Number","required":true,"placeholder":"+27 XX XXX XXXX","helpText":"","options":[],"order":4},
    {"id":"reasonForVisit","type":"textarea","label":"Reason for Visit","required":true,"placeholder":"Briefly describe your symptoms or reason for booking","helpText":"","options":[],"order":5}
  ]'::jsonb,
  '[
    {"id":"hasMedicalAid","type":"yesno","label":"Do you have Medical Aid?","required":true,"placeholder":"","helpText":"","options":[],"order":1},
    {"id":"medicalAidScheme","type":"dropdown","label":"Medical Aid Scheme","required":false,"placeholder":"Select your scheme","helpText":"","options":["Discovery Health","Momentum Health","Bonitas","Medihelp","Fedhealth","GEMS","Profmed","Other"],"order":2},
    {"id":"memberNumber","type":"text","label":"Member Number","required":false,"placeholder":"Your medical aid member number","helpText":"","options":[],"order":3},
    {"id":"currentMedications","type":"textarea","label":"Current Medications","required":false,"placeholder":"List any medications you are currently taking","helpText":"","options":[],"order":4},
    {"id":"allergies","type":"textarea","label":"Allergies","required":false,"placeholder":"List any known allergies","helpText":"","options":[],"order":5},
    {"id":"recentSymptoms","type":"textarea","label":"Recent Symptoms","required":false,"placeholder":"Describe any recent symptoms","helpText":"","options":[],"order":6},
    {"id":"consent","type":"checkbox","label":"I consent to this practice collecting my information for appointment booking and pre-consultation purposes.","required":true,"placeholder":"","helpText":"","options":[],"order":7}
  ]'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.appointments (
  id,
  practice_id,
  appointment_type_id,
  appointment_date,
  appointment_time,
  booking_answers,
  pre_consultation_answers,
  patient_display_name,
  patient_email,
  patient_phone,
  status,
  payment_status,
  payment_amount,
  confirmation_number,
  notes
) values
(
  '44444444-4444-4444-8444-444444444441',
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333331',
  (current_date + 2),
  '09:30',
  '{"firstName":"Thabo","lastName":"Molefe","email":"thabo.molefe@email.co.za","phone":"+27 82 123 4567","reasonForVisit":"Annual checkup and blood pressure monitoring"}'::jsonb,
  '{"hasMedicalAid":"Yes","medicalAidScheme":"Discovery Health","memberNumber":"DH-789456","currentMedications":"Amlodipine 5mg daily","allergies":"Penicillin","recentSymptoms":"Occasional headaches in the morning","consent":true}'::jsonb,
  'Thabo Molefe',
  'thabo.molefe@email.co.za',
  '+27 82 123 4567',
  'pending',
  'not_required',
  0,
  'TM-2026-001',
  ''
),
(
  '44444444-4444-4444-8444-444444444442',
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333332',
  (current_date + 3),
  '14:00',
  '{"firstName":"Lerato","lastName":"Ndaba","email":"lerato.ndaba@email.co.za","phone":"+27 83 234 5678","reasonForVisit":"Follow-up for diabetes management"}'::jsonb,
  '{"hasMedicalAid":"Yes","medicalAidScheme":"Bonitas","memberNumber":"BON-456123","currentMedications":"Metformin 500mg twice daily","allergies":"None known","recentSymptoms":"Blood glucose readings stable","consent":true}'::jsonb,
  'Lerato Ndaba',
  'lerato.ndaba@email.co.za',
  '+27 83 234 5678',
  'confirmed',
  'not_required',
  0,
  'LN-2026-002',
  'Patient has been managing well. Continue current treatment.'
),
(
  '44444444-4444-4444-8444-444444444443',
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333333',
  (current_date + 5),
  '10:00',
  '{"firstName":"Johan","lastName":"Botha","email":"johan.botha@email.co.za","phone":"+27 84 345 6789","reasonForVisit":"Severe lower back pain radiating to legs, affecting sleep and mobility"}'::jsonb,
  '{"hasMedicalAid":"Yes","medicalAidScheme":"Momentum Health","memberNumber":"MH-321654","currentMedications":"Ibuprofen 400mg as needed","allergies":"Sulfa drugs","recentSymptoms":"Severe lower back pain, numbness in left leg, difficulty walking","consent":true}'::jsonb,
  'Johan Botha',
  'johan.botha@email.co.za',
  '+27 84 345 6789',
  'pending',
  'pending',
  600,
  'JB-2026-003',
  'Priority review - symptoms indicate possible sciatica or disc issue'
)
on conflict (id) do nothing;
