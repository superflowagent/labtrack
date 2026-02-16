-- Enforce active subscription (or active trial) in RLS policies for clinic-scoped tables

begin;

-- Helper condition used in policies: clinic is owned by user and has active subscription or active trial
-- (subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now()))

-- Patients

drop policy if exists "Patients are scoped to clinic" on public.patients;
create policy "Patients are scoped to clinic"
  on public.patients
  for all
  using (
    clinic_id in (
      select id from public.clinics where user_id = auth.uid() and (
        subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      )
    )
  )
  with check (
    clinic_id in (
      select id from public.clinics where user_id = auth.uid() and (
        subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      )
    )
  );

-- Jobs

drop policy if exists "Jobs are scoped to clinic" on public.jobs;
create policy "Jobs are scoped to clinic"
  on public.jobs
  for all
  using (
    clinic_id in (
      select id from public.clinics where user_id = auth.uid() and (
        subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      )
    )
  )
  with check (
    clinic_id in (
      select id from public.clinics where user_id = auth.uid() and (
        subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      )
    )
  );

-- Laboratories

drop policy if exists "Laboratories are scoped to clinic" on public.laboratories;
create policy "Laboratories are scoped to clinic"
  on public.laboratories
  for all
  using (
    clinic_id in (
      select id from public.clinics where user_id = auth.uid() and (
        subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      )
    )
  )
  with check (
    clinic_id in (
      select id from public.clinics where user_id = auth.uid() and (
        subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      )
    )
  );

-- Specialists

drop policy if exists "Specialists are scoped to clinic" on public.specialists;
create policy "Specialists are scoped to clinic"
  on public.specialists
  for all
  using (
    clinic_id in (
      select id from public.clinics where user_id = auth.uid() and (
        subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      )
    )
  )
  with check (
    clinic_id in (
      select id from public.clinics where user_id = auth.uid() and (
        subscription_status in ('active','trialing') OR (stripe_trial_end IS NOT NULL AND stripe_trial_end > now())
      )
    )
  );

commit;
