begin;

alter table if exists public.clinics
  rename column nombre to name;

alter table if exists public.clinics
  rename column "user" to user_id;

alter table if exists public.profiles
  rename column nombre to name;

alter table if exists public.laboratories
  rename column nombre to name;

alter table if exists public.laboratories
  rename column contacto to contact;

alter table if exists public.laboratories
  rename column clinica_id to clinic_id;

alter table if exists public.specialists
  rename column nombre to name;

alter table if exists public.specialists
  rename column especialidad to specialty;

alter table if exists public.specialists
  rename column clinica_id to clinic_id;

alter table if exists public.jobs
  rename column paciente_nombre to patient_name;

alter table if exists public.jobs
  rename column paciente_contacto to patient_phone;

alter table if exists public.jobs
  rename column descripcion_trabajo to job_description;

alter table if exists public.jobs
  rename column laboratorio_id to laboratory_id;

alter table if exists public.jobs
  rename column especialista_id to specialist_id;

alter table if exists public.jobs
  rename column fecha_pedido to order_date;

alter table if exists public.jobs
  rename column estado to status;

alter table if exists public.jobs
  rename column clinica_id to clinic_id;

-- Refresh policies to match new column names.
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

drop policy if exists "Jobs are scoped to clinic" on public.jobs;
create policy "Jobs are scoped to clinic"
  on public.jobs
  for all
  using (clinic_id in (select id from public.clinics where user_id = auth.uid()))
  with check (clinic_id in (select id from public.clinics where user_id = auth.uid()));

drop index if exists idx_clinics_user;
drop index if exists idx_laboratories_clinica;
drop index if exists idx_specialists_clinica;
drop index if exists idx_jobs_clinica;

create index if not exists idx_clinics_user_id on public.clinics(user_id);
create index if not exists idx_laboratories_clinic_id on public.laboratories(clinic_id);
create index if not exists idx_specialists_clinic_id on public.specialists(clinic_id);
create index if not exists idx_jobs_clinic_id on public.jobs(clinic_id);

commit;
