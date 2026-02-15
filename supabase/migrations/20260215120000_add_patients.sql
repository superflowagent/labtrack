begin;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.patients enable row level security;

create policy "Patients are scoped to clinic"
  on public.patients
  for all
  using (clinic_id in (select id from public.clinics where user_id = auth.uid()))
  with check (clinic_id in (select id from public.clinics where user_id = auth.uid()));

create index if not exists idx_patients_clinic_id on public.patients(clinic_id);

alter table public.jobs
  add column if not exists patient_id uuid references public.patients(id) on delete set null;

create index if not exists idx_jobs_patient_id on public.jobs(patient_id);

commit;
