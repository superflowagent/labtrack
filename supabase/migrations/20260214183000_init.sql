create extension if not exists "pgcrypto";

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  "user" uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  clinic_id uuid references public.clinics(id) on delete set null,
  nombre text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.laboratories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text,
  clinica_id uuid not null references public.clinics(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.specialists (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  especialidad text,
  clinica_id uuid not null references public.clinics(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  paciente_nombre text not null,
  paciente_contacto text,
  descripcion_trabajo text,
  laboratorio_id uuid references public.laboratories(id) on delete set null,
  especialista_id uuid references public.specialists(id) on delete set null,
  fecha_pedido date,
  estado text not null,
  clinica_id uuid not null references public.clinics(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint jobs_estado_check check (
    estado in (
      'En laboratorio',
      'En clinica (sin citar)',
      'En clinica (citado)',
      'Cerrado'
    )
  )
);

create index if not exists idx_clinics_user on public.clinics("user");
create index if not exists idx_laboratories_clinica on public.laboratories(clinica_id);
create index if not exists idx_specialists_clinica on public.specialists(clinica_id);
create index if not exists idx_jobs_clinica on public.jobs(clinica_id);

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.laboratories enable row level security;
alter table public.specialists enable row level security;
alter table public.jobs enable row level security;

create policy "Clinics are managed by owner"
  on public.clinics
  for all
  using ("user" = auth.uid())
  with check ("user" = auth.uid());

create policy "Profiles are managed by owner"
  on public.profiles
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Laboratories are scoped to clinic"
  on public.laboratories
  for all
  using (clinica_id in (select id from public.clinics where "user" = auth.uid()))
  with check (clinica_id in (select id from public.clinics where "user" = auth.uid()));

create policy "Specialists are scoped to clinic"
  on public.specialists
  for all
  using (clinica_id in (select id from public.clinics where "user" = auth.uid()))
  with check (clinica_id in (select id from public.clinics where "user" = auth.uid()));

create policy "Jobs are scoped to clinic"
  on public.jobs
  for all
  using (clinica_id in (select id from public.clinics where "user" = auth.uid()))
  with check (clinica_id in (select id from public.clinics where "user" = auth.uid()));
