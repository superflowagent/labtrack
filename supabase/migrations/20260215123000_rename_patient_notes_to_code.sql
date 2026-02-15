begin;

alter table public.patients
  rename column notes to code;

commit;
