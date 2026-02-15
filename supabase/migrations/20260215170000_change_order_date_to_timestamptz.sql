-- Change `jobs.order_date` from DATE to TIMESTAMPTZ so it stores a full datetime.
-- Safe cast from date -> timestamptz: existing dates become midnight (00:00:00) at UTC.

begin;

alter table if exists public.jobs
  alter column order_date type timestamptz using order_date::timestamptz;

commit;
