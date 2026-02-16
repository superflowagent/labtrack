-- Add billing columns to clinics

begin;

alter table public.clinics add column if not exists stripe_customer_id text;
alter table public.clinics add column if not exists stripe_subscription_id text;
alter table public.clinics add column if not exists subscription_status text;
alter table public.clinics add column if not exists price_id text;
alter table public.clinics add column if not exists subscription_current_period_end timestamptz;
alter table public.clinics add column if not exists stripe_trial_end timestamptz;

commit;
