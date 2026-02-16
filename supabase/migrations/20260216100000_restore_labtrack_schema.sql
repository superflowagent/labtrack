-- Restore missing Labtrack tables and policies (non-destructive)
-- This migration recreates the app tables if they were accidentally dropped

begin;

create extension if not exists pgcrypto;

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  clinic_id uuid references public.clinics(id) on delete set null,
  name text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.laboratories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.specialists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  phone text,
  email text,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  code text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  job_description text,
  laboratory_id uuid references public.laboratories(id) on delete set null,
  specialist_id uuid references public.specialists(id) on delete set null,
  order_date timestamptz,
  status text not null,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint jobs_status_check check (
    status in (
      'En laboratorio',
      'En clinica (sin citar)',
      'En clinica (citado)',
      'Cerrado'
    )
  )
);

create index if not exists idx_laboratories_clinic_id on public.laboratories(clinic_id);
create index if not exists idx_specialists_clinic_id on public.specialists(clinic_id);
create index if not exists idx_patients_clinic_id on public.patients(clinic_id);
create index if not exists idx_jobs_clinic_id on public.jobs(clinic_id);
create index if not exists idx_jobs_patient_id on public.jobs(patient_id);

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.laboratories enable row level security;
alter table public.specialists enable row level security;
alter table public.patients enable row level security;
alter table public.jobs enable row level security;

-- Ensure `profiles` has the columns/constraints the app expects (non-destructive)
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS clinic_id uuid;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_clinic_id_fkey') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Policies (match application expectations)

drop policy if exists "Clinics are managed by owner" on public.clinics;
create policy "Clinics are managed by owner"
  on public.clinics
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Profiles are managed by owner" on public.profiles;
create policy "Profiles are managed by owner"
  on public.profiles
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Laboratories are scoped to clinic" on public.laboratories;
create policy "Laboratories are scoped to clinic"
  on public.laboratories
  for all
  using (clinic_id in (select id from public.clinics where user_id = auth.uid()))
  with check (clinic_id in (select id from public.clinics where user_id = auth.uid()));

drop policy if exists "Specialists are scoped to clinic" on public.specialists;
create policy "Specialists are scoped to clinic"
  on public.specialists
  for all
  using (clinic_id in (select id from public.clinics where user_id = auth.uid()))
  with check (clinic_id in (select id from public.clinics where user_id = auth.uid()));

drop policy if exists "Patients are scoped to clinic" on public.patients;
create policy "Patients are scoped to clinic"
  on public.patients
  for all
  using (clinic_id in (select id from public.clinics where user_id = auth.uid()))
  with check (clinic_id in (select id from public.clinics where user_id = auth.uid()));

drop policy if exists "Jobs are scoped to clinic" on public.jobs;
create policy "Jobs are scoped to clinic"
  on public.jobs
  for all
  using (clinic_id in (select id from public.clinics where user_id = auth.uid()))
  with check (clinic_id in (select id from public.clinics where user_id = auth.uid()));

commit;
