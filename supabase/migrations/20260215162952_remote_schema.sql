create extension if not exists "pg_cron" with schema "pg_catalog";

drop policy "Clinics are managed by owner" on "public"."clinics";

drop policy "Jobs are scoped to clinic" on "public"."jobs";

drop policy "Laboratories are scoped to clinic" on "public"."laboratories";

drop policy "Patients are scoped to clinic" on "public"."patients";

drop policy "Profiles are managed by owner" on "public"."profiles";

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

alter table "public"."clinics" drop constraint "clinics_user_fkey";

alter table "public"."jobs" drop constraint "jobs_clinica_id_fkey";

alter table "public"."jobs" drop constraint "jobs_especialista_id_fkey";

alter table "public"."jobs" drop constraint "jobs_estado_check";

alter table "public"."jobs" drop constraint "jobs_laboratorio_id_fkey";

alter table "public"."jobs" drop constraint "jobs_patient_id_fkey";

alter table "public"."laboratories" drop constraint "laboratories_clinica_id_fkey";

alter table "public"."patients" drop constraint "patients_clinic_id_fkey";

alter table "public"."profiles" drop constraint "profiles_clinic_id_fkey";

alter table "public"."profiles" drop constraint "profiles_user_id_fkey";

alter table "public"."profiles" drop constraint "profiles_user_id_key";

alter table "public"."specialists" drop constraint "specialists_clinica_id_fkey";

alter table "public"."clinics" drop constraint "clinics_pkey";

alter table "public"."jobs" drop constraint "jobs_pkey";

alter table "public"."laboratories" drop constraint "laboratories_pkey";

alter table "public"."patients" drop constraint "patients_pkey";

alter table "public"."specialists" drop constraint "specialists_pkey";

drop index if exists "public"."clinics_pkey";

drop index if exists "public"."idx_clinics_user_id";

drop index if exists "public"."idx_jobs_clinic_id";

drop index if exists "public"."idx_jobs_patient_id";

drop index if exists "public"."idx_laboratories_clinic_id";

drop index if exists "public"."idx_patients_clinic_id";

drop index if exists "public"."idx_specialists_clinic_id";

drop index if exists "public"."jobs_pkey";

drop index if exists "public"."laboratories_pkey";

drop index if exists "public"."patients_pkey";

drop index if exists "public"."profiles_user_id_key";

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

alter table "public"."profiles" drop column "clinic_id";

alter table "public"."profiles" drop column "created_at";

alter table "public"."profiles" drop column "user_id";

alter table "public"."profiles" add column "address" text;

alter table "public"."profiles" add column "allergies" text;

alter table "public"."profiles" add column "birth_date" timestamp without time zone;

alter table "public"."profiles" add column "class_credits" numeric;

alter table "public"."profiles" add column "company" uuid;

alter table "public"."profiles" add column "created" timestamp without time zone default now();

alter table "public"."profiles" add column "diagnosis" text;

alter table "public"."profiles" add column "dni" text;

alter table "public"."profiles" add column "email" text;

alter table "public"."profiles" add column "history" text;

alter table "public"."profiles" add column "invite_expires_at" timestamp without time zone;

alter table "public"."profiles" add column "invite_token" uuid;

alter table "public"."profiles" add column "last_name" text;

alter table "public"."profiles" add column "notes" text;

alter table "public"."profiles" add column "occupation" text;

alter table "public"."profiles" add column "phone" text;

alter table "public"."profiles" add column "photo_path" text;

alter table "public"."profiles" add column "role" text;

alter table "public"."profiles" add column "session_credits" numeric;

alter table "public"."profiles" add column "sport" text;

alter table "public"."profiles" add column "user" uuid;

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

alter table "public"."anatomy" add constraint "anatomy_pkey" PRIMARY KEY using index "anatomy_pkey";

alter table "public"."app_settings" add constraint "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";

alter table "public"."classes_templates" add constraint "classes_templates_pkey" PRIMARY KEY using index "classes_templates_pkey";

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."equipment" add constraint "equipment_pkey" PRIMARY KEY using index "equipment_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."exercises" add constraint "exercises_pkey" PRIMARY KEY using index "exercises_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

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

CREATE OR REPLACE FUNCTION public.accept_invite(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
    p record;
    uid_text text;
BEGIN
    -- Find profile by token (try uuid cast first)
    BEGIN
        SELECT * INTO p FROM public.profiles WHERE invite_token = p_token::uuid LIMIT 1;
    EXCEPTION WHEN invalid_text_representation THEN
        SELECT * INTO p FROM public.profiles WHERE invite_token::text = p_token LIMIT 1;
    END;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'invalid_invite_token';
    END IF;

    IF p.invite_expires_at IS NOT NULL AND p.invite_expires_at < now() THEN
        RAISE EXCEPTION 'token_expired';
    END IF;

    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    uid_text := auth.uid();

    -- Ensure profile not already linked to another user
    IF p."user" IS NOT NULL AND p."user"::text <> uid_text THEN
        RAISE EXCEPTION 'profile_already_linked';
    END IF;

    -- Link profile to current user and clear token fields
    UPDATE public.profiles
    SET "user" = uid_text::uuid, invite_token = NULL, invite_expires_at = NULL
    WHERE id = p.id;

    RETURN (SELECT to_jsonb(profiles) FROM public.profiles WHERE id = p.id);
END;
$function$
;

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

CREATE OR REPLACE FUNCTION public.accept_invite_debug(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  res jsonb;
BEGIN
  BEGIN
    -- Delegate to the existing accept_invite overloads; prefer uuid if possible
    BEGIN
      res := public.accept_invite(p_token);
      RETURN jsonb_build_object('ok', true, 'result', res);
    EXCEPTION WHEN SQLSTATE '42883' THEN
      -- Function not found for text: try uuid overload
      res := public.accept_invite(p_token::uuid);
      RETURN jsonb_build_object('ok', true, 'result', res);
    END;
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM, 'sqlstate', SQLSTATE);
  END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.accept_invite_http(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
BEGIN
  -- Cast incoming token to uuid and delegate to uuid overload to avoid operator mismatches
  RETURN public.accept_invite(p_token::uuid);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.accept_invite_verbose(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  p record;
  uid_text text := NULL;
  result jsonb := '{}'::jsonb;
BEGIN
  -- Attempt to find by uuid token first
  BEGIN
    SELECT * INTO p FROM public.profiles WHERE invite_token = p_token::uuid LIMIT 1;
  EXCEPTION WHEN invalid_text_representation THEN
    -- Token is not uuid; try text match
    BEGIN
      SELECT * INTO p FROM public.profiles WHERE invite_token::text = p_token LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('ok', false, 'step', 'select', 'error', SQLERRM);
    END;
  END;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'step', 'select', 'error', 'profile_not_found');
  END IF;

  result := result || jsonb_build_object('found_profile_id', p.id);

  -- Auth check
  BEGIN
    uid_text := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'step', 'auth', 'error', SQLERRM);
  END;

  IF uid_text IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'step', 'auth', 'error', 'not_authenticated');
  END IF;

  result := result || jsonb_build_object('auth_uid', uid_text);

  -- Check already linked (compare as text to avoid uuid<>text operator error)
  IF p."user" IS NOT NULL AND p."user"::text <> uid_text THEN
    RETURN jsonb_build_object('ok', false, 'step', 'precheck', 'error', 'profile_already_linked', 'profile_user', p."user", 'caller', uid_text);
  END IF;

  -- Attempt update
  BEGIN
    UPDATE public.profiles
    SET "user" = uid_text::uuid, invite_token = NULL, invite_expires_at = NULL
    WHERE id = p.id;
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'step', 'update', 'error', SQLERRM, 'sqlstate', SQLSTATE);
  END;

  result := result || jsonb_build_object('update', 'ok');

  -- Attempt to return JSONB representation
  BEGIN
    result := result || jsonb_build_object('profile', (SELECT to_jsonb(profiles) FROM public.profiles WHERE id = p.id));
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'step', 'to_jsonb', 'error', SQLERRM, 'sqlstate', SQLSTATE);
  END;

  RETURN jsonb_build_object('ok', true) || result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.adjust_class_credits_on_events_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  raw_client text := NULL;
  v_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  IF TG_OP = 'INSERT' THEN
    raw_client := COALESCE(NEW.client::text, '<null>');
    SELECT coalesce(array_agg(p.id), ARRAY[]::uuid[]) INTO v_ids
    FROM public.profiles p
    WHERE (p.id = ANY(public.as_uuid_array(NEW.client)) OR p."user" = ANY(public.as_uuid_array(NEW.client))) AND p.role = 'client'
      AND (p.invite_expires_at IS NULL OR p.invite_expires_at > now());

    IF COALESCE(NEW.type, '') = 'class' AND NEW.client IS NOT NULL THEN
      UPDATE public.profiles p
      SET class_credits = COALESCE(class_credits, 0) - 1
      WHERE (p.id = ANY(v_ids) OR p."user" = ANY(v_ids)) AND p.role = 'client'
        AND (p.invite_expires_at IS NULL OR p.invite_expires_at > now());
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    raw_client := COALESCE(OLD.client::text, '<null>');
    SELECT coalesce(array_agg(p.id), ARRAY[]::uuid[]) INTO v_ids
    FROM public.profiles p
    WHERE (p.id = ANY(public.as_uuid_array(OLD.client)) OR p."user" = ANY(public.as_uuid_array(OLD.client))) AND p.role = 'client'
      AND (p.invite_expires_at IS NULL OR p.invite_expires_at > now());

    IF COALESCE(OLD.type, '') = 'class' AND OLD.client IS NOT NULL THEN
      UPDATE public.profiles p
      SET class_credits = COALESCE(class_credits, 0) + 1
      WHERE (p.id = ANY(v_ids) OR p."user" = ANY(v_ids)) AND p.role = 'client'
        AND (p.invite_expires_at IS NULL OR p.invite_expires_at > now());
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    raw_client := COALESCE(NEW.client::text, '<null>');

    -- Transition: non-class -> class (deduct for all NEW clients)
    IF COALESCE(OLD.type,'') <> 'class' AND COALESCE(NEW.type,'') = 'class' THEN
      SELECT coalesce(array_agg(p.id), ARRAY[]::uuid[]) INTO v_ids
      FROM public.profiles p
      WHERE (p.id = ANY(public.as_uuid_array(NEW.client)) OR p."user" = ANY(public.as_uuid_array(NEW.client))) AND p.role = 'client';

      IF array_length(v_ids,1) IS NOT NULL THEN
        UPDATE public.profiles p
        SET class_credits = COALESCE(class_credits, 0) - 1
        WHERE (p.id = ANY(v_ids) OR p.user = ANY(v_ids)) AND p.role = 'client';
      END IF;

    -- Transition: class -> non-class (refund for all OLD clients)
    ELSIF COALESCE(OLD.type,'') = 'class' AND COALESCE(NEW.type,'') <> 'class' THEN
      SELECT coalesce(array_agg(p.id), ARRAY[]::uuid[]) INTO v_ids
      FROM public.profiles p
      WHERE (p.id = ANY(public.as_uuid_array(OLD.client)) OR p."user" = ANY(public.as_uuid_array(OLD.client))) AND p.role = 'client';

      IF array_length(v_ids,1) IS NOT NULL THEN
        UPDATE public.profiles p
        SET class_credits = COALESCE(class_credits, 0) + 1
        WHERE (p.id = ANY(v_ids) OR p.user = ANY(v_ids)) AND p.role = 'client';
      END IF;

    -- Otherwise: both classes or both non-classes — keep add/remove behavior for class->class changes
    ELSE
      IF COALESCE(NEW.type,'') = 'class' OR COALESCE(OLD.type,'') = 'class' THEN
        -- Added
        WITH new_clients AS (
          SELECT unnest(public.as_uuid_array(NEW.client)) AS id
        ),
        old_clients AS (
          SELECT unnest(public.as_uuid_array(OLD.client)) AS id
        ),
        added AS (
          SELECT id FROM new_clients EXCEPT SELECT id FROM old_clients
        )
        SELECT coalesce(array_agg(id), ARRAY[]::uuid[]) INTO v_ids FROM added;

        IF array_length(v_ids,1) IS NOT NULL THEN
          UPDATE public.profiles p
          SET class_credits = COALESCE(class_credits, 0) - 1
          WHERE (p.id = ANY(v_ids) OR p.user = ANY(v_ids)) AND p.role = 'client'
            AND (p.invite_expires_at IS NULL OR p.invite_expires_at > now());
        END IF;

        -- Removed
        WITH new_clients AS (
          SELECT unnest(public.as_uuid_array(NEW.client)) AS id
        ),
        old_clients AS (
          SELECT unnest(public.as_uuid_array(OLD.client)) AS id
        ),
        removed AS (
          SELECT id FROM old_clients EXCEPT SELECT id FROM new_clients
        )
        SELECT coalesce(array_agg(id), ARRAY[]::uuid[]) INTO v_ids FROM removed;

        IF array_length(v_ids,1) IS NOT NULL THEN
          UPDATE public.profiles p
          SET class_credits = COALESCE(class_credits, 0) + 1
          WHERE (p.id = ANY(v_ids) OR p.user = ANY(v_ids)) AND p.role = 'client'
            AND (p.invite_expires_at IS NULL OR p.invite_expires_at > now());
        END IF;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.as_uuid_array(_val anyarray)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF _val IS NULL THEN
    RETURN ARRAY[]::uuid[];
  END IF;

  BEGIN
    RETURN (SELECT coalesce(array_agg(x::uuid), ARRAY[]::uuid[]) FROM unnest(_val) AS x);
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN ARRAY[]::uuid[];
  END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.as_uuid_array(_val anyelement)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  _t text := pg_typeof(_val)::text;
  _res uuid[] := ARRAY[]::uuid[];
BEGIN
  IF _val IS NULL THEN
    RETURN _res;
  END IF;

  IF _t = 'uuid[]' THEN
    RETURN _val;
  ELSIF _t IN ('text','varchar','character varying') THEN
    BEGIN
      _res := ARRAY[ NULLIF(_val::text,'')::uuid ];
      RETURN _res;
    EXCEPTION WHEN invalid_text_representation THEN
      RETURN ARRAY[]::uuid[];
    END;
  ELSIF right(_t, 2) = '[]' THEN
    BEGIN
      RETURN (SELECT coalesce(array_agg(x::uuid), ARRAY[]::uuid[]) FROM unnest(_val) AS x);
    EXCEPTION WHEN invalid_text_representation THEN
      RETURN ARRAY[]::uuid[];
    END;
  ELSE
    RETURN ARRAY[]::uuid[];
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.as_uuid_array(_val uuid[])
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF _val IS NULL THEN
    RETURN ARRAY[]::uuid[];
  ELSE
    RETURN _val;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_auth_user_for_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  existing_id uuid;
  new_id uuid;
BEGIN
  -- If profile already linked or has no email, nothing to do
  IF NEW."user" IS NOT NULL OR NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  -- If an auth user with the same email already exists, reuse it
  SELECT id INTO existing_id FROM auth.users WHERE email = NEW.email LIMIT 1;
  IF existing_id IS NOT NULL THEN
    NEW."user" = existing_id;
    RETURN NEW;
  END IF;

  -- Otherwise try to create a new auth.user, but handle race conditions
  BEGIN
    INSERT INTO auth.users (id, email, created_at, raw_user_meta_data)
      VALUES (gen_random_uuid(), NEW.email, now(), jsonb_build_object('created_from', 'profiles_trigger'))
      RETURNING id INTO new_id;
    NEW."user" = new_id;
    RETURN NEW;
  EXCEPTION WHEN unique_violation THEN
    -- Concurrent insert inserted the user; fetch the id and reuse
    SELECT id INTO new_id FROM auth.users WHERE email = NEW.email LIMIT 1;
    IF new_id IS NOT NULL THEN
      NEW."user" = new_id;
      RETURN NEW;
    END IF;
    -- If we still didn't find it, rethrow so caller sees an error
    RAISE;
  END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.dbg_accept_invite_sim(p_token uuid, p_caller uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
    p record;
BEGIN
    SELECT * INTO p FROM public.profiles WHERE invite_token = p_token LIMIT 1;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'profile_not_found');
    END IF;

    IF p.invite_expires_at IS NOT NULL AND p.invite_expires_at < now() THEN
        RETURN jsonb_build_object('error', 'token_expired');
    END IF;

    IF p.user IS NOT NULL AND p.user <> p_caller THEN
        RETURN jsonb_build_object('error', 'profile_already_linked');
    END IF;

    UPDATE public.profiles
    SET "user" = p_caller, invite_token = NULL, invite_expires_at = NULL
    WHERE id = p.id;

    RETURN (SELECT to_jsonb(profiles) FROM public.profiles WHERE id = p.id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.dbg_delete_profile_sim(p_profile_id uuid, p_caller uuid, p_delete_auth boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_auth_user uuid := NULL;
BEGIN
  IF p_caller IS NULL THEN
    RAISE EXCEPTION 'p_caller required for dbg';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = p_profile_id LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p."user" = p_caller
      AND p.company::text = v_profile.company::text
      AND (p.role = 'professional' OR p.role = 'admin' OR p.role = 'owner')
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  v_auth_user := v_profile."user";

  DELETE FROM public.profiles WHERE id = p_profile_id;

  IF p_delete_auth AND v_auth_user IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_auth_user;
  END IF;

  RETURN jsonb_build_object('ok', true, 'profile_id', p_profile_id::text, 'deleted_auth_user', COALESCE(v_auth_user::text, NULL));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.debug_get_caller_info()
 RETURNS TABLE(caller_uid text, caller_company uuid)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT auth.uid()::text AS caller_uid,
    (SELECT company FROM public.profiles WHERE user::text = auth.uid()::text LIMIT 1) AS caller_company;
$function$
;

CREATE OR REPLACE FUNCTION public.debug_list_pg_triggers_profiles()
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT jsonb_agg(row_to_json(q)) FROM (
    SELECT t.tgname, p.proname as function_name, n.nspname as function_schema, t.tgenabled
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE t.tgrelid = 'public.profiles'::regclass
  ) q;
$function$
;

CREATE OR REPLACE FUNCTION public.debug_list_profiles_triggers()
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT jsonb_agg(row_to_json(t)) FROM information_schema.triggers t WHERE t.event_object_table = 'profiles';
$function$
;

CREATE OR REPLACE FUNCTION public.delete_event_json(p_payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  p_id uuid := (p_payload->>'id')::uuid;
  v_company uuid;
BEGIN
  SELECT company INTO v_company FROM public.events WHERE id = p_id LIMIT 1;
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'event not found';
  END IF;

  IF NOT public.is_professional_of_company(v_company) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  DELETE FROM public.events WHERE id = p_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_profile_rpc(p_profile_id uuid, p_delete_auth boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_caller_uuid text;
  v_auth_user uuid := NULL;
BEGIN
  -- Authentication
  BEGIN
    v_caller_uuid := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'not_authenticated';
  END;
  IF v_caller_uuid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Lookup target profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_profile_id LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  -- Authorization: caller must be an authenticated company member with role professional/admin/owner
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p."user" = v_caller_uuid::uuid
      AND p.company::text = v_profile.company::text
      AND (p.role = 'professional' OR p.role = 'admin' OR p.role = 'owner')
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Capture linked auth user
  v_auth_user := v_profile."user";

  -- Delete profile row
  DELETE FROM public.profiles WHERE id = p_profile_id;

  -- Optionally delete auth user row
  IF p_delete_auth AND v_auth_user IS NOT NULL THEN
    -- Attempt to remove the auth user; let errors bubble up if something unexpected happens
    DELETE FROM auth.users WHERE id = v_auth_user;
  END IF;

  RETURN jsonb_build_object('ok', true, 'profile_id', p_profile_id::text, 'deleted_auth_user', COALESCE(v_auth_user::text, NULL));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_set_program_exercise_notes()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public, pg_temp'
AS $function$
BEGIN
  -- If notes is empty or NULL, attempt to copy description from exercises table
  IF (NEW.notes IS NULL OR TRIM(NEW.notes) = '') THEN
    NEW.notes := (SELECT description FROM public.exercises WHERE id = NEW.exercise LIMIT 1);
  END IF;
  RETURN NEW;
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

CREATE OR REPLACE FUNCTION public.get_event_attendee_profiles(p_event uuid)
 RETURNS TABLE(id uuid, "user" uuid, name text, last_name text, photo_path text, sport text, class_credits integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT p.id, p."user", p.name, p.last_name, p.photo_path, p.sport, p.class_credits
  FROM public.events e
  JOIN public.profiles p ON (p.id = ANY(e.client) OR p."user" = ANY(e.client))
  WHERE e.id = p_event
    AND p.company = e.company;
$function$
;

CREATE OR REPLACE FUNCTION public.get_events_for_company(p_company uuid)
 RETURNS TABLE(id uuid, company uuid, datetime text, duration integer, type text, client uuid[], professional uuid[], notes text, cost numeric, paid boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT
    e.id,
    e.company,
    to_char(e.datetime, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS datetime,
    e.duration,
    e.type,
    e.client,
    e.professional,
    e.notes,
    e.cost,
    e.paid
  FROM public.events e
  JOIN public.profiles p ON p."user" = auth.uid()
  WHERE e.company = p.company
  ORDER BY e.datetime ASC;
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

CREATE OR REPLACE FUNCTION public.get_profiles_by_ids_for_clients(p_ids uuid[])
 RETURNS TABLE(id uuid, "user" uuid, name text, last_name text, photo_path text, sport text, class_credits integer, dni text, phone text, email text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits, dni, phone, email
  FROM public.profiles
  WHERE (id = ANY(p_ids) OR "user" = ANY(p_ids))
    AND company = (
      SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_by_ids_for_clients(p_ids uuid[], p_company uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, "user" uuid, name text, last_name text, photo_path text, sport text, class_credits integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits
  FROM public.profiles
  WHERE (id = ANY(p_ids) OR "user" = ANY(p_ids))
    AND company = COALESCE(
      p_company,
      (SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1)
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_by_ids_for_professionals(p_ids uuid[])
 RETURNS TABLE(id uuid, user_id uuid, name text, last_name text, email text, phone text, photo_path text, role text, company uuid, class_credits integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT p.id, p.user AS user_id, p.name, p.last_name, p.email, p.phone, p.photo_path, p.role, p.company, p.class_credits
  FROM public.profiles p
  WHERE (p.user = ANY(p_ids) OR p.id = ANY(p_ids))
    AND public.is_member_of_company(p.company)
    AND EXISTS (
      SELECT 1 FROM public.profiles pu
      WHERE pu.user::text = auth.uid()::text
        AND pu.role = 'professional'
        AND pu.company IS NOT DISTINCT FROM p.company
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_by_ids_for_professionals(p_ids uuid[], p_company uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, "user" uuid, name text, last_name text, photo_path text, sport text, class_credits integer, dni text, phone text, email text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits, dni, phone, email
  FROM public.profiles
  WHERE (id = ANY(p_ids) OR "user" = ANY(p_ids))
    AND role = 'professional'
    AND company = COALESCE(
      p_company,
      (SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1)
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_by_role_for_clients(p_role text)
 RETURNS TABLE(id uuid, user_id uuid, name text, last_name text, photo_path text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT p.id, p.user AS user_id, p.name, p.last_name, p.photo_path
  FROM public.profiles p
  WHERE p.role = p_role
    AND public.is_member_of_company(p.company);
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_by_role_for_clients(p_role text, p_company uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, "user" uuid, name text, last_name text, photo_path text, sport text, class_credits integer, dni text, phone text, email text, address text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits, dni, phone, email, address
  FROM public.profiles
  WHERE role = p_role
    AND company = COALESCE(
      p_company,
      (SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1)
    )
  ORDER BY name;
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_by_role_for_professionals(p_role text)
 RETURNS TABLE(id uuid, user_id uuid, name text, last_name text, email text, phone text, photo_path text, role text, company uuid, class_credits integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT p.id, p.user AS user_id, p.name, p.last_name, p.email, p.phone, p.photo_path, p.role, p.company, p.class_credits
  FROM public.profiles p
  WHERE p.role = p_role
    AND public.is_member_of_company(p.company)
    AND EXISTS (
      SELECT 1 FROM public.profiles pu
      WHERE pu.user::text = auth.uid()::text
        AND pu.role = 'professional'
        AND pu.company IS NOT DISTINCT FROM p.company
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_by_role_for_professionals(p_role text, p_company uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, "user" uuid, name text, last_name text, photo_path text, sport text, class_credits integer, dni text, phone text, email text, address text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits, dni, phone, email, address
  FROM public.profiles
  WHERE role = p_role
    AND company = COALESCE(
      p_company,
      (SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1)
    )
  ORDER BY name;
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_for_professionals()
 RETURNS TABLE(id uuid, user_id uuid, name text, last_name text, email text, phone text, photo_path text, role text, company uuid, class_credits integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT p.id, p.user AS user_id, p.name, p.last_name, p.email, p.phone, p.photo_path, p.role, p.company, p.class_credits
  FROM public.profiles p
  WHERE public.is_member_of_company(p.company)
    AND EXISTS (
      SELECT 1 FROM public.profiles pu
      WHERE pu.user::text = auth.uid()::text
        AND pu.role = 'professional'
        AND pu.company IS NOT DISTINCT FROM p.company
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_profiles_policies()
 RETURNS TABLE(polname text, using_expr text, with_check text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT polname,
         pg_get_expr(polqual, polrelid) AS using_expr,
         pg_get_expr(polwithcheck, polrelid) AS with_check
  FROM pg_policy
  WHERE polrelid = 'public.profiles'::regclass;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_event_json(p_payload jsonb)
 RETURNS TABLE(id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  v_type text := p_payload->>'type';
  v_duration int := NULLIF(p_payload->>'duration','')::int;
  v_cost numeric := NULLIF(p_payload->>'cost','')::numeric;
  v_paid boolean := NULLIF(p_payload->>'paid','')::boolean;
  v_notes text := p_payload->>'notes';
  v_datetime text := p_payload->>'datetime';
  v_client uuid[] := ARRAY[]::uuid[];
  v_professional uuid[] := ARRAY[]::uuid[];
  v_company uuid := NULLIF(p_payload->>'company','')::uuid;
BEGIN
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'company is required';
  END IF;

  -- Normalize `client` payload: accept array or scalar uuid string; reject/raise for other scalar types
  IF p_payload ? 'client' THEN
    CASE jsonb_typeof(p_payload->'client')
      WHEN 'array' THEN
        BEGIN
          SELECT coalesce(array_agg(x::uuid), ARRAY[]::uuid[]) INTO v_client
          FROM jsonb_array_elements_text(p_payload->'client') AS x;
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE EXCEPTION 'invalid uuid value in client array';
        END;
      WHEN 'string' THEN
        BEGIN
          v_client := ARRAY[ NULLIF(p_payload->>'client','')::uuid ];
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE EXCEPTION 'invalid uuid value in client';
        END;
      WHEN 'null' THEN
        v_client := ARRAY[]::uuid[];
      ELSE
        -- When client is a scalar of an unexpected type (e.g. boolean), reject with clear message
        RAISE EXCEPTION 'client must be an array of uuid or a uuid string';
    END CASE;

    -- Map any client entries that are actually profile.user -> profile.id
    IF array_length(v_client,1) IS NOT NULL THEN
      SELECT coalesce(array_agg(p.id), ARRAY[]::uuid[]) INTO v_client
      FROM unnest(v_client) AS x
      INNER JOIN public.profiles p ON (p.user::text = x::text OR p.id::text = x::text);
    END IF;
  END IF;

  -- Normalize `professional` payload
  IF p_payload ? 'professional' THEN
    CASE jsonb_typeof(p_payload->'professional')
      WHEN 'array' THEN
        BEGIN
          SELECT coalesce(array_agg(x::uuid), ARRAY[]::uuid[]) INTO v_professional
          FROM jsonb_array_elements_text(p_payload->'professional') AS x;
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE EXCEPTION 'invalid uuid value in professional array';
        END;
      WHEN 'string' THEN
        BEGIN
          v_professional := ARRAY[ NULLIF(p_payload->>'professional','')::uuid ];
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE EXCEPTION 'invalid uuid value in professional';
        END;
      WHEN 'null' THEN
        v_professional := ARRAY[]::uuid[];
      ELSE
        RAISE EXCEPTION 'professional must be an array of uuid or a uuid string';
    END CASE;

    -- Map any professional entries that are actually profile.user -> profile.id
    IF array_length(v_professional,1) IS NOT NULL THEN
      SELECT coalesce(array_agg(p.id), ARRAY[]::uuid[]) INTO v_professional
      FROM unnest(v_professional) AS x
      INNER JOIN public.profiles p ON (p.user = x::uuid OR p.id = x::uuid);
    END IF;
  END IF;

  -- Allow insert when the caller is a professional of the company
  -- or when the caller is a client creating an appointment for themself
  IF NOT (
    public.is_professional_of_company(v_company)
    OR (
      v_type = 'appointment'
      AND (
        -- auth.uid() may match an element of v_client (profile id or user id)
        (auth.uid() IS NOT NULL AND auth.uid() = ANY(v_client))
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user = auth.uid()
            AND p.company = v_company
            AND p.role = 'client'
            AND (
              p.id = ANY(v_client)
              OR p.user = ANY(v_client)
            )
        )
      )
    )
  ) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  RETURN QUERY
    INSERT INTO public.events (type, duration, cost, paid, notes, datetime, client, professional, company)
    VALUES (v_type, v_duration, v_cost, v_paid, v_notes, v_datetime::timestamptz, v_client, v_professional, v_company)
    RETURNING public.events.id AS id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_member_of_company(p_company uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p."user" = auth.uid() OR p.id = auth.uid() OR p.user::text = auth.uid()::text)
      AND p.company = p_company
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_professional_of_company(p_company uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p."user" = auth.uid() OR p.id = auth.uid() OR p.user::text = auth.uid()::text)
      AND p.company = p_company
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_profile_admin_of(company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user = auth.uid() AND p.role = 'admin' AND p.company = company_id
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_profile_member_of(company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p.user = auth.uid() OR p.id = auth.uid()) AND p.company = company_id
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_profile_professional_or_admin_of(p_company uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p."user" = auth.uid() OR p.id = auth.uid())
      AND p.company = p_company
      AND (p.role = 'professional' OR p.role = 'admin')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_same_company(p_company uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
BEGIN
  -- Security Definer (owner: postgres) bypasses RLS on profiles, breaking recursion
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE ("user" = auth.uid() OR id = auth.uid())
      AND company = p_company
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    caller_profile public.profiles%ROWTYPE;
BEGIN
    -- Only check if role is being changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- Get the caller's profile
        SELECT * INTO caller_profile FROM public.profiles 
        WHERE "user" = auth.uid() OR id = auth.uid() 
        LIMIT 1;
        
        -- Only admins can change roles to or from 'admin'
        -- Non-admins can only keep the same role
        IF caller_profile.role IS DISTINCT FROM 'admin' THEN
            RAISE EXCEPTION 'Permission denied: only admins can change roles';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reset_reminder_on_event_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Check if the date/time or relevant fields changed
    IF (OLD.datetime IS DISTINCT FROM NEW.datetime) OR
       (OLD.client IS DISTINCT FROM NEW.client) OR
       (OLD.professional IS DISTINCT FROM NEW.professional) OR
       (OLD.company IS DISTINCT FROM NEW.company) THEN
        NEW.reminder_sent := false;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.unlink_deleted_anatomy_from_exercises()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Remove the deleted anatomy id from any exercise arrays
  UPDATE public.exercises ex
  SET anatomy = array_remove(ex.anatomy, OLD.id)
  WHERE OLD.id = ANY (ex.anatomy);
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.unlink_deleted_equipment_from_exercises()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Remove the deleted equipment id from any exercise arrays
  UPDATE public.exercises ex
  SET equipment = array_remove(ex.equipment, OLD.id)
  WHERE OLD.id = ANY (ex.equipment);
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_event_json(p_payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public, pg_temp'
AS $function$
DECLARE
  v_id uuid := NULLIF(p_payload->>'id','')::uuid;
  v_changes jsonb := COALESCE(p_payload->'changes', '{}'::jsonb);
  v_type text := v_changes->>'type';
  v_duration int := NULLIF(v_changes->>'duration','')::int;
  v_cost numeric := NULLIF(v_changes->>'cost','')::numeric;
  v_paid boolean := NULLIF(v_changes->>'paid','')::boolean;
  v_notes text := v_changes->>'notes';
  v_datetime text := v_changes->>'datetime';
  v_client uuid[] := NULL;
  v_professional uuid[] := NULL;
  v_event_company uuid := NULL;
  v_event_type text := NULL;
  v_event_client uuid[] := ARRAY[]::uuid[];
  v_new_clients uuid[] := ARRAY[]::uuid[];
  v_my_profile_id uuid := NULL;
  v_my_user_id uuid := NULL;
  v_auth_uid_text text := NULL;
  v_added uuid[] := ARRAY[]::uuid[];
  v_removed uuid[] := ARRAY[]::uuid[];
BEGIN
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'id is required';
  END IF;

  -- Normalize `client` payload: accept array or scalar uuid string
  IF v_changes ? 'client' THEN
    CASE jsonb_typeof(v_changes->'client')
      WHEN 'array' THEN
        BEGIN
          SELECT coalesce(array_agg(x::uuid), ARRAY[]::uuid[]) INTO v_client
          FROM jsonb_array_elements_text(v_changes->'client') AS x;
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE EXCEPTION 'invalid uuid value in client array';
        END;
      WHEN 'string' THEN
        BEGIN
          v_client := ARRAY[ NULLIF(v_changes->>'client','')::uuid ];
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE EXCEPTION 'invalid uuid value in client';
        END;
      WHEN 'null' THEN
        v_client := ARRAY[]::uuid[];
      ELSE
        RAISE EXCEPTION 'client must be an array of uuid or a uuid string';
    END CASE;

    -- Map any client entries that are actually profile.user -> profile.id
    IF array_length(v_client,1) IS NOT NULL THEN
      SELECT coalesce(array_agg(p.id), ARRAY[]::uuid[]) INTO v_client
      FROM unnest(v_client) AS x
      INNER JOIN public.profiles p ON (p.user::text = x::text OR p.id::text = x::text);
    END IF;
  END IF;

  -- Normalize `professional` payload
  IF v_changes ? 'professional' THEN
    CASE jsonb_typeof(v_changes->'professional')
      WHEN 'array' THEN
        BEGIN
          SELECT coalesce(array_agg(x::uuid), ARRAY[]::uuid[]) INTO v_professional
          FROM jsonb_array_elements_text(v_changes->'professional') AS x;
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE EXCEPTION 'invalid uuid value in professional array';
        END;
      WHEN 'string' THEN
        BEGIN
          v_professional := ARRAY[ NULLIF(v_changes->>'professional','')::uuid ];
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE EXCEPTION 'invalid uuid value in professional';
        END;
      WHEN 'null' THEN
        v_professional := ARRAY[]::uuid[];
      ELSE
        RAISE EXCEPTION 'professional must be an array of uuid or a uuid string';
    END CASE;

    -- Map any professional entries that are actually profile.user -> profile.id
    IF array_length(v_professional,1) IS NOT NULL THEN
      SELECT coalesce(array_agg(p.id), ARRAY[]::uuid[]) INTO v_professional
      FROM unnest(v_professional) AS x
      INNER JOIN public.profiles p ON (p.user = x::uuid OR p.id = x::uuid);
    END IF;
  END IF;

  -- Load event details (company, type and current client list)
  SELECT company, type, client::text INTO v_event_company, v_event_type, v_event_client
  FROM public.events WHERE id = v_id;
  IF v_event_company IS NULL THEN
    RAISE EXCEPTION 'event not found';
  END IF;

  -- Normalize whatever was stored in events.client into a uuid[] safely
  v_event_client := public.as_uuid_array(v_event_client);

  -- Permission checks
  v_auth_uid_text := auth.uid();
  IF v_auth_uid_text IS NOT NULL AND v_auth_uid_text <> '' THEN
    v_my_user_id := v_auth_uid_text::uuid;
  ELSE
    v_my_user_id := NULL;
  END IF;

  IF v_my_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user = v_my_user_id
      AND p.company = v_event_company
      AND (p.role = 'professional' OR p.role = 'admin')
  ) THEN
    -- allowed
  ELSE
    IF NOT (v_changes ? 'client' AND (v_changes - 'client') = '{}'::jsonb) THEN
      RAISE EXCEPTION 'permission denied';
    END IF;

    SELECT id INTO v_my_profile_id FROM public.profiles p WHERE p.user = v_my_user_id AND p.company = v_event_company LIMIT 1;
    v_new_clients := COALESCE(v_client, ARRAY[]::uuid[]);

    SELECT coalesce(array_agg(x), ARRAY[]::uuid[]) INTO v_added
    FROM unnest(v_new_clients) AS x
    WHERE NOT x = ANY(v_event_client);

    SELECT coalesce(array_agg(x), ARRAY[]::uuid[]) INTO v_removed
    FROM unnest(v_event_client) AS x
    WHERE NOT x = ANY(v_new_clients);

    IF v_event_type <> 'class' THEN
      RAISE EXCEPTION 'permission denied';
    END IF;

    IF EXISTS (
      SELECT 1 FROM unnest(coalesce(v_added, ARRAY[]::uuid[]) || coalesce(v_removed, ARRAY[]::uuid[])) AS u(x)
      WHERE NOT (
        (v_my_user_id IS NOT NULL AND x = v_my_user_id)
        OR (v_my_profile_id IS NOT NULL AND x = v_my_profile_id)
      )
    ) THEN
      RAISE EXCEPTION 'permission denied';
    END IF;
  END IF;

  -- Perform the update
  UPDATE public.events
  SET
    type = CASE WHEN v_changes ? 'type' THEN v_type ELSE type END,
    duration = CASE WHEN v_changes ? 'duration' THEN v_duration ELSE duration END,
    cost = CASE WHEN v_changes ? 'cost' THEN v_cost ELSE cost END,
    paid = CASE WHEN v_changes ? 'paid' THEN v_paid ELSE paid END,
    notes = CASE WHEN v_changes ? 'notes' THEN v_notes ELSE notes END,
    datetime = CASE WHEN v_changes ? 'datetime' AND NULLIF(v_datetime,'') IS NOT NULL THEN v_datetime::timestamptz ELSE datetime END,
    client = CASE WHEN v_changes ? 'client' THEN COALESCE(v_client, ARRAY[]::uuid[]) ELSE client END,
    professional = CASE WHEN v_changes ? 'professional' THEN COALESCE(v_professional, ARRAY[]::uuid[]) ELSE professional END
  WHERE id = v_id;
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



