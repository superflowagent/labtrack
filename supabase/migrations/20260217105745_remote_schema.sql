drop policy "Clinics are managed by owner" on "public"."clinics";

drop policy "Jobs are scoped to clinic" on "public"."jobs";

drop policy "Laboratories are scoped to clinic" on "public"."laboratories";

drop policy "Patients are scoped to clinic" on "public"."patients";

drop policy "Specialists are scoped to clinic" on "public"."specialists";

revoke delete on table "public"."clinics" from "anon";

revoke insert on table "public"."clinics" from "anon";

revoke references on table "public"."clinics" from "anon";

revoke select on table "public"."clinics" from "anon";

revoke trigger on table "public"."clinics" from "anon";

revoke truncate on table "public"."clinics" from "anon";

revoke update on table "public"."clinics" from "anon";

revoke delete on table "public"."clinics" from "authenticated";

revoke insert on table "public"."clinics" from "authenticated";

revoke references on table "public"."clinics" from "authenticated";

revoke select on table "public"."clinics" from "authenticated";

revoke trigger on table "public"."clinics" from "authenticated";

revoke truncate on table "public"."clinics" from "authenticated";

revoke update on table "public"."clinics" from "authenticated";

revoke delete on table "public"."clinics" from "service_role";

revoke insert on table "public"."clinics" from "service_role";

revoke references on table "public"."clinics" from "service_role";

revoke select on table "public"."clinics" from "service_role";

revoke trigger on table "public"."clinics" from "service_role";

revoke truncate on table "public"."clinics" from "service_role";

revoke update on table "public"."clinics" from "service_role";

revoke delete on table "public"."jobs" from "anon";

revoke insert on table "public"."jobs" from "anon";

revoke references on table "public"."jobs" from "anon";

revoke select on table "public"."jobs" from "anon";

revoke trigger on table "public"."jobs" from "anon";

revoke truncate on table "public"."jobs" from "anon";

revoke update on table "public"."jobs" from "anon";

revoke delete on table "public"."jobs" from "authenticated";

revoke insert on table "public"."jobs" from "authenticated";

revoke references on table "public"."jobs" from "authenticated";

revoke select on table "public"."jobs" from "authenticated";

revoke trigger on table "public"."jobs" from "authenticated";

revoke truncate on table "public"."jobs" from "authenticated";

revoke update on table "public"."jobs" from "authenticated";

revoke delete on table "public"."jobs" from "service_role";

revoke insert on table "public"."jobs" from "service_role";

revoke references on table "public"."jobs" from "service_role";

revoke select on table "public"."jobs" from "service_role";

revoke trigger on table "public"."jobs" from "service_role";

revoke truncate on table "public"."jobs" from "service_role";

revoke update on table "public"."jobs" from "service_role";

revoke delete on table "public"."laboratories" from "anon";

revoke insert on table "public"."laboratories" from "anon";

revoke references on table "public"."laboratories" from "anon";

revoke select on table "public"."laboratories" from "anon";

revoke trigger on table "public"."laboratories" from "anon";

revoke truncate on table "public"."laboratories" from "anon";

revoke update on table "public"."laboratories" from "anon";

revoke delete on table "public"."laboratories" from "authenticated";

revoke insert on table "public"."laboratories" from "authenticated";

revoke references on table "public"."laboratories" from "authenticated";

revoke select on table "public"."laboratories" from "authenticated";

revoke trigger on table "public"."laboratories" from "authenticated";

revoke truncate on table "public"."laboratories" from "authenticated";

revoke update on table "public"."laboratories" from "authenticated";

revoke delete on table "public"."laboratories" from "service_role";

revoke insert on table "public"."laboratories" from "service_role";

revoke references on table "public"."laboratories" from "service_role";

revoke select on table "public"."laboratories" from "service_role";

revoke trigger on table "public"."laboratories" from "service_role";

revoke truncate on table "public"."laboratories" from "service_role";

revoke update on table "public"."laboratories" from "service_role";

revoke delete on table "public"."patients" from "anon";

revoke insert on table "public"."patients" from "anon";

revoke references on table "public"."patients" from "anon";

revoke select on table "public"."patients" from "anon";

revoke trigger on table "public"."patients" from "anon";

revoke truncate on table "public"."patients" from "anon";

revoke update on table "public"."patients" from "anon";

revoke delete on table "public"."patients" from "authenticated";

revoke insert on table "public"."patients" from "authenticated";

revoke references on table "public"."patients" from "authenticated";

revoke select on table "public"."patients" from "authenticated";

revoke trigger on table "public"."patients" from "authenticated";

revoke truncate on table "public"."patients" from "authenticated";

revoke update on table "public"."patients" from "authenticated";

revoke delete on table "public"."patients" from "service_role";

revoke insert on table "public"."patients" from "service_role";

revoke references on table "public"."patients" from "service_role";

revoke select on table "public"."patients" from "service_role";

revoke trigger on table "public"."patients" from "service_role";

revoke truncate on table "public"."patients" from "service_role";

revoke update on table "public"."patients" from "service_role";

revoke delete on table "public"."specialists" from "anon";

revoke insert on table "public"."specialists" from "anon";

revoke references on table "public"."specialists" from "anon";

revoke select on table "public"."specialists" from "anon";

revoke trigger on table "public"."specialists" from "anon";

revoke truncate on table "public"."specialists" from "anon";

revoke update on table "public"."specialists" from "anon";

revoke delete on table "public"."specialists" from "authenticated";

revoke insert on table "public"."specialists" from "authenticated";

revoke references on table "public"."specialists" from "authenticated";

revoke select on table "public"."specialists" from "authenticated";

revoke trigger on table "public"."specialists" from "authenticated";

revoke truncate on table "public"."specialists" from "authenticated";

revoke update on table "public"."specialists" from "authenticated";

revoke delete on table "public"."specialists" from "service_role";

revoke insert on table "public"."specialists" from "service_role";

revoke references on table "public"."specialists" from "service_role";

revoke select on table "public"."specialists" from "service_role";

revoke trigger on table "public"."specialists" from "service_role";

revoke truncate on table "public"."specialists" from "service_role";

revoke update on table "public"."specialists" from "service_role";

alter table "public"."clinics" drop constraint "clinics_user_id_fkey";

alter table "public"."jobs" drop constraint "jobs_clinic_id_fkey";

alter table "public"."jobs" drop constraint "jobs_laboratory_id_fkey";

alter table "public"."jobs" drop constraint "jobs_patient_id_fkey";

alter table "public"."jobs" drop constraint "jobs_specialist_id_fkey";

alter table "public"."jobs" drop constraint "jobs_status_check";

alter table "public"."laboratories" drop constraint "laboratories_clinic_id_fkey";

alter table "public"."patients" drop constraint "patients_clinic_id_fkey";

alter table "public"."specialists" drop constraint "specialists_clinic_id_fkey";

drop function if exists "public"."check_subscription_status"(user_email text);

alter table "public"."clinics" drop constraint "clinics_pkey";

alter table "public"."jobs" drop constraint "jobs_pkey";

alter table "public"."laboratories" drop constraint "laboratories_pkey";

alter table "public"."patients" drop constraint "patients_pkey";

alter table "public"."specialists" drop constraint "specialists_pkey";

drop index if exists "public"."clinics_pkey";

drop index if exists "public"."idx_jobs_clinic_id";

drop index if exists "public"."idx_jobs_patient_id";

drop index if exists "public"."idx_laboratories_clinic_id";

drop index if exists "public"."idx_patients_clinic_id";

drop index if exists "public"."idx_specialists_clinic_id";

drop index if exists "public"."jobs_pkey";

drop index if exists "public"."laboratories_pkey";

drop index if exists "public"."patients_pkey";

drop index if exists "public"."specialists_pkey";

drop table "public"."clinics";

drop table "public"."jobs";

drop table "public"."laboratories";

drop table "public"."patients";

drop table "public"."specialists";


  create table "public"."anatomy" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "created" timestamp without time zone default now(),
    "company" uuid
      );


alter table "public"."anatomy" enable row level security;


  create table "public"."app_settings" (
    "key" text not null,
    "value" text not null,
    "created_at" timestamp without time zone not null default now()
      );


alter table "public"."app_settings" enable row level security;


  create table "public"."classes_templates" (
    "id" uuid not null default gen_random_uuid(),
    "type" text default 'class'::text,
    "created" timestamp without time zone default now(),
    "duration" numeric,
    "cost" numeric default '0'::numeric,
    "paid" boolean default false,
    "notes" text,
    "company" uuid,
    "client" uuid[] default '{}'::uuid[],
    "professional" uuid[] default '{}'::uuid[],
    "time" time without time zone,
    "day" numeric
      );


alter table "public"."classes_templates" enable row level security;


  create table "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "max_class_assistants" numeric default '5'::numeric,
    "class_block_mins" numeric default '720'::numeric,
    "class_unenroll_mins" numeric default '120'::numeric,
    "logo_path" text default ''::text,
    "open_time" time without time zone default '07:00:00'::time without time zone,
    "close_time" time without time zone default '19:00:00'::time without time zone,
    "default_appointment_duration" numeric default '60'::numeric,
    "default_class_duration" numeric default '90'::numeric,
    "domain" text,
    "created" timestamp without time zone default now(),
    "self_schedule" boolean not null default false,
    "appointment_reminder" boolean not null default true,
    "nif" text,
    "address" text
      );


alter table "public"."companies" enable row level security;


  create table "public"."equipment" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "created" timestamp without time zone default now(),
    "company" uuid
      );


alter table "public"."equipment" enable row level security;


  create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "type" text,
    "datetime" timestamp with time zone,
    "created" timestamp without time zone default now(),
    "duration" numeric,
    "cost" numeric,
    "paid" boolean,
    "notes" text,
    "company" uuid,
    "client" uuid[] default '{}'::uuid[],
    "professional" uuid[] default '{}'::uuid[],
    "reminder_sent" boolean default false
      );


alter table "public"."events" enable row level security;


  create table "public"."exercises" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "file" text,
    "created" timestamp without time zone default now(),
    "description" text,
    "company" uuid,
    "anatomy" uuid[] default '{}'::uuid[],
    "equipment" uuid[] default '{}'::uuid[]
      );


alter table "public"."exercises" enable row level security;


  create table "public"."invoices" (
    "id" uuid not null default gen_random_uuid(),
    "recipient_id" uuid not null,
    "recipient_name" text not null,
    "recipient_nif" text,
    "recipient_address" text,
    "issuer_id" text not null,
    "issuer_name" text not null,
    "issuer_nif" text,
    "issuer_address" text,
    "concept" text not null,
    "issue_date" date not null,
    "operation_date" date,
    "total_amount" numeric not null,
    "vat_percentage" numeric not null default 0,
    "status" text not null default 'pendiente'::text,
    "notes" text,
    "company" uuid not null,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "number" integer
      );


alter table "public"."invoices" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "created" timestamp without time zone default now(),
    "company" uuid,
    "photo_path" text,
    "last_name" text,
    "dni" text,
    "phone" text,
    "birth_date" timestamp without time zone,
    "role" text,
    "address" text,
    "occupation" text,
    "sport" text,
    "session_credits" numeric,
    "class_credits" numeric,
    "history" text,
    "diagnosis" text,
    "notes" text,
    "allergies" text,
    "user" uuid,
    "invite_token" uuid,
    "invite_expires_at" timestamp without time zone,
    "email" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."program_exercises" (
    "id" uuid not null default gen_random_uuid(),
    "notes" text,
    "exercise" uuid,
    "reps" numeric,
    "weight" numeric,
    "sets" numeric,
    "secs" numeric,
    "program" uuid,
    "position" numeric,
    "day" text
      );


alter table "public"."program_exercises" enable row level security;


  create table "public"."programs" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "created" timestamp without time zone default now(),
    "company" uuid,
    "profile" uuid,
    "description" text,
    "position" numeric
      );


alter table "public"."programs" enable row level security;

CREATE UNIQUE INDEX anatomy_pkey ON public.anatomy USING btree (id);

CREATE UNIQUE INDEX app_settings_pkey ON public.app_settings USING btree (key);

CREATE INDEX classes_templates_company_idx ON public.classes_templates USING btree (company);

CREATE UNIQUE INDEX classes_templates_pkey ON public.classes_templates USING btree (id);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX equipment_pkey ON public.equipment USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX exercises_aux_pkey ON public.program_exercises USING btree (id);

CREATE UNIQUE INDEX exercises_pkey ON public.exercises USING btree (id);

CREATE INDEX idx_classes_templates_company ON public.classes_templates USING btree (company);

CREATE INDEX idx_invoices_company ON public.invoices USING btree (company);

CREATE INDEX idx_invoices_company_issue_date ON public.invoices USING btree (company, issue_date DESC);

CREATE INDEX idx_invoices_issue_date ON public.invoices USING btree (issue_date DESC);

CREATE INDEX idx_invoices_recipient ON public.invoices USING btree (recipient_id);

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX plans_pkey ON public.programs USING btree (id);

CREATE UNIQUE INDEX profiles_invite_token_unique ON public.profiles USING btree (invite_token) WHERE (invite_token IS NOT NULL);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."anatomy" add constraint "anatomy_pkey" PRIMARY KEY using index "anatomy_pkey";

alter table "public"."app_settings" add constraint "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";

alter table "public"."classes_templates" add constraint "classes_templates_pkey" PRIMARY KEY using index "classes_templates_pkey";

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."equipment" add constraint "equipment_pkey" PRIMARY KEY using index "equipment_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."exercises" add constraint "exercises_pkey" PRIMARY KEY using index "exercises_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."program_exercises" add constraint "exercises_aux_pkey" PRIMARY KEY using index "exercises_aux_pkey";

alter table "public"."programs" add constraint "plans_pkey" PRIMARY KEY using index "plans_pkey";

alter table "public"."anatomy" add constraint "anatomy_company_fkey" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."anatomy" validate constraint "anatomy_company_fkey";

alter table "public"."classes_templates" add constraint "classes_templates_company_fkey" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."classes_templates" validate constraint "classes_templates_company_fkey";

alter table "public"."classes_templates" add constraint "classes_templates_company_fkey1" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."classes_templates" validate constraint "classes_templates_company_fkey1";

alter table "public"."equipment" add constraint "equipment_company_fkey" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."equipment" validate constraint "equipment_company_fkey";

alter table "public"."events" add constraint "events_company_fkey" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_company_fkey";

alter table "public"."exercises" add constraint "exercises_company_fkey" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."exercises" validate constraint "exercises_company_fkey";

alter table "public"."invoices" add constraint "invoices_company_fkey" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_company_fkey";

alter table "public"."profiles" add constraint "profiles_company_fkey" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_company_fkey";

alter table "public"."profiles" add constraint "profiles_invite_expires_valid" CHECK (((invite_expires_at IS NULL) OR (invite_expires_at > now()))) not valid;

alter table "public"."profiles" validate constraint "profiles_invite_expires_valid";

alter table "public"."profiles" add constraint "profiles_user_fkey" FOREIGN KEY ("user") REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_fkey";

alter table "public"."program_exercises" add constraint "exercises_aux_exercise_fkey" FOREIGN KEY (exercise) REFERENCES public.exercises(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."program_exercises" validate constraint "exercises_aux_exercise_fkey";

alter table "public"."program_exercises" add constraint "program_exercises_program_fkey" FOREIGN KEY (program) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."program_exercises" validate constraint "program_exercises_program_fkey";

alter table "public"."programs" add constraint "plans_company_fkey" FOREIGN KEY (company) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."programs" validate constraint "plans_company_fkey";

alter table "public"."programs" add constraint "plans_profile_fkey" FOREIGN KEY (profile) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."programs" validate constraint "plans_profile_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.accept_invite(p_token uuid)
 RETURNS SETOF public.profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  -- Find invited profile
  SELECT * INTO v_profile FROM public.profiles WHERE invite_token = p_token LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_invite_token';
  END IF;

  -- Check expiration if provided (invite_expires_at is a timestamp)
  IF v_profile.invite_expires_at IS NOT NULL AND v_profile.invite_expires_at < now() THEN
    RAISE EXCEPTION 'invite_expired';
  END IF;

  -- Ensure the profile isn't already linked to a user
  IF v_profile."user" IS NOT NULL THEN
    RAISE EXCEPTION 'invite_already_accepted';
  END IF;

  -- Perform the update linking the current authenticated user
  UPDATE public.profiles
  SET "user" = auth.uid(), invite_token = NULL, invite_expires_at = NULL
  WHERE id = v_profile.id;

  -- Return the updated profile
  RETURN QUERY
  SELECT * FROM public.profiles WHERE id = v_profile.id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_company_by_id(p_company uuid)
 RETURNS SETOF public.companies
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT c.*
  FROM public.companies c
  WHERE c.id = p_company
    AND public.is_member_of_company(c.id)
$function$
;

CREATE OR REPLACE FUNCTION public.get_profile_by_user(p_user uuid)
 RETURNS public.profiles
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  rec public.profiles%ROWTYPE;
  has_user_id boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='user_id'
  ) INTO has_user_id;

  IF has_user_id THEN
    SELECT * INTO rec FROM public.profiles WHERE "user" = p_user OR id = p_user OR user_id = p_user LIMIT 1;
  ELSE
    SELECT * INTO rec FROM public.profiles WHERE "user" = p_user OR id = p_user LIMIT 1;
  END IF;

  RETURN rec;
END;
$function$
;

grant delete on table "public"."anatomy" to "anon";

grant insert on table "public"."anatomy" to "anon";

grant references on table "public"."anatomy" to "anon";

grant select on table "public"."anatomy" to "anon";

grant trigger on table "public"."anatomy" to "anon";

grant truncate on table "public"."anatomy" to "anon";

grant update on table "public"."anatomy" to "anon";

grant delete on table "public"."anatomy" to "authenticated";

grant insert on table "public"."anatomy" to "authenticated";

grant references on table "public"."anatomy" to "authenticated";

grant select on table "public"."anatomy" to "authenticated";

grant trigger on table "public"."anatomy" to "authenticated";

grant truncate on table "public"."anatomy" to "authenticated";

grant update on table "public"."anatomy" to "authenticated";

grant delete on table "public"."anatomy" to "service_role";

grant insert on table "public"."anatomy" to "service_role";

grant references on table "public"."anatomy" to "service_role";

grant select on table "public"."anatomy" to "service_role";

grant trigger on table "public"."anatomy" to "service_role";

grant truncate on table "public"."anatomy" to "service_role";

grant update on table "public"."anatomy" to "service_role";

grant delete on table "public"."app_settings" to "anon";

grant insert on table "public"."app_settings" to "anon";

grant references on table "public"."app_settings" to "anon";

grant select on table "public"."app_settings" to "anon";

grant trigger on table "public"."app_settings" to "anon";

grant truncate on table "public"."app_settings" to "anon";

grant update on table "public"."app_settings" to "anon";

grant delete on table "public"."app_settings" to "authenticated";

grant insert on table "public"."app_settings" to "authenticated";

grant references on table "public"."app_settings" to "authenticated";

grant select on table "public"."app_settings" to "authenticated";

grant trigger on table "public"."app_settings" to "authenticated";

grant truncate on table "public"."app_settings" to "authenticated";

grant update on table "public"."app_settings" to "authenticated";

grant delete on table "public"."app_settings" to "service_role";

grant insert on table "public"."app_settings" to "service_role";

grant references on table "public"."app_settings" to "service_role";

grant select on table "public"."app_settings" to "service_role";

grant trigger on table "public"."app_settings" to "service_role";

grant truncate on table "public"."app_settings" to "service_role";

grant update on table "public"."app_settings" to "service_role";

grant delete on table "public"."classes_templates" to "anon";

grant insert on table "public"."classes_templates" to "anon";

grant references on table "public"."classes_templates" to "anon";

grant select on table "public"."classes_templates" to "anon";

grant trigger on table "public"."classes_templates" to "anon";

grant truncate on table "public"."classes_templates" to "anon";

grant update on table "public"."classes_templates" to "anon";

grant delete on table "public"."classes_templates" to "authenticated";

grant insert on table "public"."classes_templates" to "authenticated";

grant references on table "public"."classes_templates" to "authenticated";

grant select on table "public"."classes_templates" to "authenticated";

grant trigger on table "public"."classes_templates" to "authenticated";

grant truncate on table "public"."classes_templates" to "authenticated";

grant update on table "public"."classes_templates" to "authenticated";

grant delete on table "public"."classes_templates" to "service_role";

grant insert on table "public"."classes_templates" to "service_role";

grant references on table "public"."classes_templates" to "service_role";

grant select on table "public"."classes_templates" to "service_role";

grant trigger on table "public"."classes_templates" to "service_role";

grant truncate on table "public"."classes_templates" to "service_role";

grant update on table "public"."classes_templates" to "service_role";

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."equipment" to "anon";

grant insert on table "public"."equipment" to "anon";

grant references on table "public"."equipment" to "anon";

grant select on table "public"."equipment" to "anon";

grant trigger on table "public"."equipment" to "anon";

grant truncate on table "public"."equipment" to "anon";

grant update on table "public"."equipment" to "anon";

grant delete on table "public"."equipment" to "authenticated";

grant insert on table "public"."equipment" to "authenticated";

grant references on table "public"."equipment" to "authenticated";

grant select on table "public"."equipment" to "authenticated";

grant trigger on table "public"."equipment" to "authenticated";

grant truncate on table "public"."equipment" to "authenticated";

grant update on table "public"."equipment" to "authenticated";

grant delete on table "public"."equipment" to "service_role";

grant insert on table "public"."equipment" to "service_role";

grant references on table "public"."equipment" to "service_role";

grant select on table "public"."equipment" to "service_role";

grant trigger on table "public"."equipment" to "service_role";

grant truncate on table "public"."equipment" to "service_role";

grant update on table "public"."equipment" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."exercises" to "anon";

grant insert on table "public"."exercises" to "anon";

grant references on table "public"."exercises" to "anon";

grant select on table "public"."exercises" to "anon";

grant trigger on table "public"."exercises" to "anon";

grant truncate on table "public"."exercises" to "anon";

grant update on table "public"."exercises" to "anon";

grant delete on table "public"."exercises" to "authenticated";

grant insert on table "public"."exercises" to "authenticated";

grant references on table "public"."exercises" to "authenticated";

grant select on table "public"."exercises" to "authenticated";

grant trigger on table "public"."exercises" to "authenticated";

grant truncate on table "public"."exercises" to "authenticated";

grant update on table "public"."exercises" to "authenticated";

grant delete on table "public"."exercises" to "service_role";

grant insert on table "public"."exercises" to "service_role";

grant references on table "public"."exercises" to "service_role";

grant select on table "public"."exercises" to "service_role";

grant trigger on table "public"."exercises" to "service_role";

grant truncate on table "public"."exercises" to "service_role";

grant update on table "public"."exercises" to "service_role";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."program_exercises" to "anon";

grant insert on table "public"."program_exercises" to "anon";

grant references on table "public"."program_exercises" to "anon";

grant select on table "public"."program_exercises" to "anon";

grant trigger on table "public"."program_exercises" to "anon";

grant truncate on table "public"."program_exercises" to "anon";

grant update on table "public"."program_exercises" to "anon";

grant delete on table "public"."program_exercises" to "authenticated";

grant insert on table "public"."program_exercises" to "authenticated";

grant references on table "public"."program_exercises" to "authenticated";

grant select on table "public"."program_exercises" to "authenticated";

grant trigger on table "public"."program_exercises" to "authenticated";

grant truncate on table "public"."program_exercises" to "authenticated";

grant update on table "public"."program_exercises" to "authenticated";

grant delete on table "public"."program_exercises" to "service_role";

grant insert on table "public"."program_exercises" to "service_role";

grant references on table "public"."program_exercises" to "service_role";

grant select on table "public"."program_exercises" to "service_role";

grant trigger on table "public"."program_exercises" to "service_role";

grant truncate on table "public"."program_exercises" to "service_role";

grant update on table "public"."program_exercises" to "service_role";

grant delete on table "public"."programs" to "anon";

grant insert on table "public"."programs" to "anon";

grant references on table "public"."programs" to "anon";

grant select on table "public"."programs" to "anon";

grant trigger on table "public"."programs" to "anon";

grant truncate on table "public"."programs" to "anon";

grant update on table "public"."programs" to "anon";

grant delete on table "public"."programs" to "authenticated";

grant insert on table "public"."programs" to "authenticated";

grant references on table "public"."programs" to "authenticated";

grant select on table "public"."programs" to "authenticated";

grant trigger on table "public"."programs" to "authenticated";

grant truncate on table "public"."programs" to "authenticated";

grant update on table "public"."programs" to "authenticated";

grant delete on table "public"."programs" to "service_role";

grant insert on table "public"."programs" to "service_role";

grant references on table "public"."programs" to "service_role";

grant select on table "public"."programs" to "service_role";

grant trigger on table "public"."programs" to "service_role";

grant truncate on table "public"."programs" to "service_role";

grant update on table "public"."programs" to "service_role";


  create policy "Company members can delete"
  on "public"."anatomy"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = anatomy.company)))));



  create policy "Company members can update"
  on "public"."anatomy"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = anatomy.company)))))
with check ((company = ( SELECT p.company
   FROM public.profiles p
  WHERE (p."user" = ( SELECT auth.uid() AS uid))
 LIMIT 1)));



  create policy "consolidated_anatomy_ALL_7e395fad90c84700a574e94abc1303fd"
  on "public"."anatomy"
  as permissive
  for all
  to authenticated, authenticated, service_role, authenticated, service_role
using (((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text) AND (p.company = anatomy.company)))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text) AND (p.company = anatomy.company)))))))
with check (((company = ( SELECT p.company
   FROM public.profiles p
  WHERE (p."user" = ( SELECT auth.uid() AS uid))
 LIMIT 1)) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text))))) OR ((company = ( SELECT p.company
   FROM public.profiles p
  WHERE (p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid))
 LIMIT 1)) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text))))))));



  create policy "consolidated_anatomy_SELECT_62f5bf9d595b304c604ca8ad89dd0d1b"
  on "public"."anatomy"
  as permissive
  for select
  to authenticated, authenticated, authenticated
using (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = anatomy.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.company = anatomy.company)))) OR ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = anatomy.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = anatomy.company)))))));



  create policy "app_settings_service_role_all"
  on "public"."app_settings"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "delete_classes_templates_by_professional"
  on "public"."classes_templates"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = classes_templates.company) AND (p.role = 'professional'::text)))));



  create policy "insert_classes_templates_by_professional"
  on "public"."classes_templates"
  as permissive
  for all
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = classes_templates.company) AND (p.role = 'professional'::text)))));



  create policy "select_classes_templates_by_company"
  on "public"."classes_templates"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = classes_templates.company)))));



  create policy "update_classes_templates_by_professional"
  on "public"."classes_templates"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = classes_templates.company) AND (p.role = 'professional'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = classes_templates.company) AND (p.role = 'professional'::text)))));



  create policy "consolidated_companies_SELECT_d5c5a50b2bb23214f139f9df8964150d"
  on "public"."companies"
  as permissive
  for select
  to authenticated, authenticated, authenticated
using ((public.is_member_of_company(id) OR public.is_same_company(id) OR public.is_member_of_company(id) OR public.is_profile_member_of(id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.company = companies.id)))) OR (public.is_member_of_company(id) OR public.is_same_company(id) OR public.is_member_of_company(id) OR public.is_profile_member_of(id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = companies.id)))))));



  create policy "consolidated_companies_UPDATE_4c55137c7901f8bca0397ab302448f14"
  on "public"."companies"
  as permissive
  for update
  to authenticated, authenticated, authenticated
using ((public.is_professional_of_company(id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text) AND (p.company = companies.id)))) OR (public.is_professional_of_company(id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text) AND (p.company = companies.id)))))))
with check ((public.is_professional_of_company(id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text)))) OR (public.is_professional_of_company(id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text)))))));



  create policy "Company members can delete"
  on "public"."equipment"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = equipment.company)))));



  create policy "Company members can update"
  on "public"."equipment"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = equipment.company)))))
with check ((company = ( SELECT p.company
   FROM public.profiles p
  WHERE (p."user" = ( SELECT auth.uid() AS uid))
 LIMIT 1)));



  create policy "consolidated_equipment_ALL_f171f0b05197fdcc1aa5ba0b546ff49e"
  on "public"."equipment"
  as permissive
  for all
  to authenticated, authenticated, service_role, authenticated, service_role
using (((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text) AND (p.company = equipment.company)))) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text) AND (p.company = equipment.company)))))))
with check (((company = ( SELECT p.company
   FROM public.profiles p
  WHERE (p."user" = ( SELECT auth.uid() AS uid))
 LIMIT 1)) OR ((company = ( SELECT p.company
   FROM public.profiles p
  WHERE (p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid))
 LIMIT 1)) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text)))))) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text)))))));



  create policy "consolidated_equipment_SELECT_41a12516224504406c2ddbc32761ebdc"
  on "public"."equipment"
  as permissive
  for select
  to authenticated, authenticated, authenticated
using (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = equipment.company)))) OR ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = equipment.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = equipment.company))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.company = equipment.company))))));



  create policy "consolidated_events_ALL_a2adf990f30a8a9de3ca4f9e93c2b6aa"
  on "public"."events"
  as permissive
  for all
  to authenticated, service_role, authenticated, service_role, authenticated, authenticated
with check (((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text) AND (p.company = p.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = ANY (ARRAY['professional'::text, 'admin'::text])) AND (p.company = p.company)))) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text) AND (p.company = p.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.role = ANY (ARRAY['professional'::text, 'admin'::text])) AND (p.company = p.company))))));



  create policy "consolidated_events_DELETE_a6085873ebad4a75910c7690e3432315"
  on "public"."events"
  as permissive
  for delete
  to authenticated, service_role, authenticated, authenticated, service_role, authenticated
using (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = events.company)))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text) AND (p.company = events.company))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = events.company)))) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text) AND (p.company = events.company))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = events.company))))));



  create policy "consolidated_events_SELECT_9f4961b7d5cf17fd4914077201023255"
  on "public"."events"
  as permissive
  for select
  to authenticated, authenticated, authenticated, authenticated, authenticated
using ((public.is_same_company(company) OR (public.is_same_company(company) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = events.company) AND ((p.role = 'professional'::text) OR ((p.role = 'client'::text) AND ((events.type = 'class'::text) OR ((events.type = 'appointment'::text) AND ((p.id = ANY (events.client)) OR (p."user" = ANY (events.client))))))))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = events.company) AND ((p.role = 'professional'::text) OR ((p.role = 'client'::text) AND ((events.type = 'class'::text) OR ((events.type = 'appointment'::text) AND ((p.id = ANY (events.client)) OR (p."user" = ANY (events.client))))))))))));



  create policy "consolidated_events_UPDATE_2e6fb697055400c0c6297162e3b866d8"
  on "public"."events"
  as permissive
  for update
  to authenticated, service_role, authenticated, authenticated, authenticated, service_role
using ((public.is_same_company(company) OR (public.is_same_company(company) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = events.company)))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text) AND (p.company = events.company)))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = events.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = events.company)))) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text) AND (p.company = events.company)))))))
with check ((public.is_same_company(company) OR (public.is_same_company(company) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = p.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = p.company)))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text)))))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = p.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = p.company)))) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text)))))));



  create policy "Company members can delete"
  on "public"."exercises"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = exercises.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))));



  create policy "Company members can update"
  on "public"."exercises"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = exercises.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = exercises.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))));



  create policy "consolidated_exercises_ALL_fc17ef7e7cff1447bffa6db1d65ad2a0"
  on "public"."exercises"
  as permissive
  for all
  to authenticated, authenticated, service_role, authenticated, service_role
using (((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text) AND (p.company = exercises.company)))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text) AND (p.company = exercises.company)))))))
with check (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = exercises.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'professional'::text))))) OR ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = exercises.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.role = 'professional'::text))))))));



  create policy "consolidated_exercises_SELECT_45ab3a2959f8f997c4bfe984a8b0ffdb"
  on "public"."exercises"
  as permissive
  for select
  to authenticated, authenticated, authenticated
using (((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = exercises.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.company = exercises.company)))) OR ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = exercises.company)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) AND (p.company = exercises.company)))))));



  create policy "invoices_delete_company_professionals"
  on "public"."invoices"
  as permissive
  for delete
  to public
using (public.is_professional_of_company(company));



  create policy "invoices_insert_company_professionals"
  on "public"."invoices"
  as permissive
  for insert
  to public
with check (public.is_professional_of_company(company));



  create policy "invoices_select_company_members"
  on "public"."invoices"
  as permissive
  for select
  to public
using (public.is_profile_member_of(company));



  create policy "invoices_update_company_professionals"
  on "public"."invoices"
  as permissive
  for update
  to public
using (public.is_professional_of_company(company))
with check (public.is_professional_of_company(company));



  create policy "profiles_delete_policy"
  on "public"."profiles"
  as permissive
  for delete
  to authenticated
using (((auth.uid() = "user") OR (auth.role() = 'service_role'::text) OR ((company IS NOT NULL) AND public.is_profile_professional_or_admin_of(company))));



  create policy "profiles_insert_policy"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = "user") OR (auth.role() = 'service_role'::text) OR ((company IS NOT NULL) AND public.is_profile_professional_or_admin_of(company))));



  create policy "profiles_select_policy"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (((auth.uid() = "user") OR (auth.role() = 'service_role'::text) OR ((company IS NOT NULL) AND public.is_profile_professional_or_admin_of(company))));



  create policy "profiles_update_policy"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using (((auth.uid() = "user") OR (auth.role() = 'service_role'::text) OR ((company IS NOT NULL) AND public.is_profile_professional_or_admin_of(company))))
with check (((auth.uid() = "user") OR (auth.role() = 'service_role'::text) OR ((company IS NOT NULL) AND public.is_profile_professional_or_admin_of(company))));



  create policy "Company members can delete"
  on "public"."program_exercises"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.programs prog ON ((prog.company = p.company)))
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (prog.id = program_exercises.program) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))));



  create policy "Company members can insert"
  on "public"."program_exercises"
  as permissive
  for all
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.programs prog ON ((prog.company = p.company)))
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (prog.id = program_exercises.program) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))));



  create policy "Company members can select"
  on "public"."program_exercises"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.programs prog ON ((prog.company = p.company)))
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (prog.id = program_exercises.program)))));



  create policy "Company members can update"
  on "public"."program_exercises"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.programs prog ON ((prog.company = p.company)))
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (prog.id = program_exercises.program) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))))
with check ((EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.programs prog ON ((prog.company = p.company)))
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (prog.id = program_exercises.program) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))));



  create policy "Company members can delete"
  on "public"."programs"
  as permissive
  for delete
  to authenticated, service_role
using (((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = programs.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text)))))));



  create policy "Company members can insert"
  on "public"."programs"
  as permissive
  for all
  to authenticated, service_role
with check (((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE (((p.id = ( SELECT auth.uid() AS uid)) OR (p."user" = ( SELECT auth.uid() AS uid))) AND (p.company = programs.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text)))))));



  create policy "Company members can select"
  on "public"."programs"
  as permissive
  for select
  to authenticated, service_role
using (((( SELECT auth.role() AS role) = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE (((p.id = ( SELECT auth.uid() AS uid)) OR (p."user" = ( SELECT auth.uid() AS uid))) AND (p.company = programs.company))))));



  create policy "Company members can update"
  on "public"."programs"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = programs.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p."user" = ( SELECT auth.uid() AS uid)) AND (p.company = programs.company) AND ((p.role = 'professional'::text) OR (p.role = 'admin'::text))))));


CREATE TRIGGER trg_unlink_anatomy_from_exercises AFTER DELETE ON public.anatomy FOR EACH ROW EXECUTE FUNCTION public.unlink_deleted_anatomy_from_exercises();

CREATE TRIGGER trg_unlink_equipment_from_exercises AFTER DELETE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.unlink_deleted_equipment_from_exercises();

CREATE TRIGGER trg_adjust_class_credits AFTER INSERT OR DELETE OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.adjust_class_credits_on_events_change();

CREATE TRIGGER trg_reset_reminder_on_change BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.reset_reminder_on_event_change();

CREATE TRIGGER trg_prevent_role_escalation BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

CREATE TRIGGER trg_set_program_exercise_notes BEFORE INSERT ON public.program_exercises FOR EACH ROW EXECUTE FUNCTION public.fn_set_program_exercise_notes();


  create policy "consolidated_storage.objects_ALL_ffd5cf7c93cae97e4e95c82d20ecc8"
  on "storage"."objects"
  as permissive
  for all
  to authenticated, authenticated, service_role, authenticated, authenticated, service_role
with check ((((bucket_id = 'company_logos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text)) OR ((( SELECT auth.role() AS role) = 'service_role'::text) OR ((bucket_id = 'exercise_videos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text))) OR ((bucket_id = 'profile_photos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text)) OR (((bucket_id = 'profile_photos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text)) OR ((bucket_id = 'company_logos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text)) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR ((bucket_id = 'exercise_videos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text))) OR ((bucket_id = 'profile_photos'::text) AND (( SELECT ( SELECT auth.uid() AS uid) AS uid) IS NOT NULL)) OR ((bucket_id = 'company_logos'::text) AND ("substring"(name, '^[^/]+'::text) = ( SELECT (profiles.company)::text AS company
   FROM public.profiles
  WHERE (profiles."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid))
 LIMIT 1))))));



  create policy "consolidated_storage.objects_DELETE_545d7503834a9fa7d46b13fb05d"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated, service_role, authenticated, authenticated, authenticated, service_role
using (((( SELECT auth.role() AS role) = 'service_role'::text) OR ((bucket_id = 'exercise_videos'::text) AND ((owner = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE (((p."user" = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid))) AND (p.company = (split_part(p.name, '/'::text, 1))::uuid)))))) OR ((bucket_id = 'company_logos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND (owner = ( SELECT auth.uid() AS uid))) OR ((bucket_id = 'profile_photos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND (owner = ( SELECT auth.uid() AS uid))) OR (((bucket_id = 'profile_photos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text) AND (owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) OR ((bucket_id = 'company_logos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text) AND (owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR ((bucket_id = 'exercise_videos'::text) AND ((owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE (((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) OR (p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) AND (p.company = (split_part(p.name, '/'::text, 1))::uuid))))))) OR ((bucket_id = 'profile_photos'::text) AND (( SELECT ( SELECT auth.uid() AS uid) AS uid) IS NOT NULL)) OR ((bucket_id = 'company_logos'::text) AND ("substring"(name, '^[^/]+'::text) = ( SELECT (profiles.company)::text AS company
   FROM public.profiles
  WHERE (profiles."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid))
 LIMIT 1))))));



  create policy "consolidated_storage.objects_SELECT_36aa322b620f8d3a9ac39c10c5d"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((((bucket_id = 'profile_photos'::text) AND (( SELECT ( SELECT auth.uid() AS uid) AS uid) IS NOT NULL)) OR ((bucket_id = 'company_logos'::text) AND ("substring"(name, '^[^/]+'::text) = ( SELECT (profiles.company)::text AS company
   FROM public.profiles
  WHERE (profiles."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid))
 LIMIT 1)))));



  create policy "consolidated_storage.objects_UPDATE_d9c530e163c723b92cab155b3ac"
  on "storage"."objects"
  as permissive
  for update
  to authenticated, service_role, authenticated, authenticated, authenticated, service_role
using (((( SELECT auth.role() AS role) = 'service_role'::text) OR ((bucket_id = 'exercise_videos'::text) AND ((owner = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE (((p."user" = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid))) AND (p.company = (split_part(p.name, '/'::text, 1))::uuid)))))) OR ((bucket_id = 'company_logos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND (owner = ( SELECT auth.uid() AS uid))) OR ((bucket_id = 'profile_photos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND (owner = ( SELECT auth.uid() AS uid))) OR (((bucket_id = 'profile_photos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text) AND (owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) OR ((bucket_id = 'company_logos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text) AND (owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR ((bucket_id = 'exercise_videos'::text) AND ((owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE (((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) OR (p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) AND (p.company = (split_part(p.name, '/'::text, 1))::uuid))))))) OR ((bucket_id = 'company_logos'::text) AND ("substring"(name, '^[^/]+'::text) = ( SELECT (profiles.company)::text AS company
   FROM public.profiles
  WHERE (profiles."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid))
 LIMIT 1))))))
with check (((( SELECT auth.role() AS role) = 'service_role'::text) OR ((bucket_id = 'exercise_videos'::text) AND ((owner = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE (((p."user" = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid))) AND (p.company = (split_part(p.name, '/'::text, 1))::uuid)))))) OR ((bucket_id = 'company_logos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND (owner = ( SELECT auth.uid() AS uid))) OR ((bucket_id = 'profile_photos'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND (owner = ( SELECT auth.uid() AS uid))) OR (((bucket_id = 'profile_photos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text) AND (owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) OR ((bucket_id = 'company_logos'::text) AND (( SELECT ( SELECT auth.role() AS role) AS role) = 'authenticated'::text) AND (owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) OR ((( SELECT ( SELECT auth.role() AS role) AS role) = 'service_role'::text) OR ((bucket_id = 'exercise_videos'::text) AND ((owner = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE (((p."user" = ( SELECT ( SELECT auth.uid() AS uid) AS uid)) OR (p.id = ( SELECT ( SELECT auth.uid() AS uid) AS uid))) AND (p.company = (split_part(p.name, '/'::text, 1))::uuid))))))))));



