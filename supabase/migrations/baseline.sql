


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."accept_invite"("p_token" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."accept_invite"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_invite_debug"("p_token" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."accept_invite_debug"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_invite_http"("p_token" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
BEGIN
  -- Cast incoming token to uuid and delegate to uuid overload to avoid operator mismatches
  RETURN public.accept_invite(p_token::uuid);
END;
$$;


ALTER FUNCTION "public"."accept_invite_http"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_invite_verbose"("p_token" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."accept_invite_verbose"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."adjust_class_credits_on_events_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."adjust_class_credits_on_events_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."as_uuid_array"("_val" "uuid"[]) RETURNS "uuid"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF _val IS NULL THEN
    RETURN ARRAY[]::uuid[];
  ELSE
    RETURN _val;
  END IF;
END;
$$;


ALTER FUNCTION "public"."as_uuid_array"("_val" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."as_uuid_array"("_val" "anyarray") RETURNS "uuid"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."as_uuid_array"("_val" "anyarray") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."as_uuid_array"("_val" "anyelement") RETURNS "uuid"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."as_uuid_array"("_val" "anyelement") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_subscription_status"("user_email" "text") RETURNS TABLE("stripe_customer_id" "text", "subscription_status" "text", "stripe_trial_end" timestamp with time zone, "needs_update" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  v_clinic_id uuid;
  v_user_id uuid;
  v_trial_end timestamp with time zone;
  v_sub_status text;
begin
  -- Get the current user
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Get clinic for this user
  select id, stripe_trial_end, subscription_status 
  into v_clinic_id, v_trial_end, v_sub_status
  from public.clinics 
  where user_id = v_user_id 
  limit 1;

  if v_clinic_id is null then
    raise exception 'No clinic found for user';
  end if;

  -- Check if trial is still valid
  if v_trial_end > now() then
    return query select null::text, 'trialing'::text, v_trial_end, false;
    return;
  end if;

  -- If trial expired and no subscription, return not subscribed
  if v_sub_status is null or v_sub_status != 'active' then
    return query select null::text, 'inactive'::text, null::timestamp with time zone, false;
    return;
  end if;

  -- Return current subscription status
  return query 
  select c.stripe_customer_id, c.subscription_status, c.stripe_trial_end, false
  from public.clinics c
  where c.id = v_clinic_id;
end;
$$;


ALTER FUNCTION "public"."check_subscription_status"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_auth_user_for_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."create_auth_user_for_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dbg_accept_invite_sim"("p_token" "uuid", "p_caller" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."dbg_accept_invite_sim"("p_token" "uuid", "p_caller" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dbg_delete_profile_sim"("p_profile_id" "uuid", "p_caller" "uuid", "p_delete_auth" boolean DEFAULT true) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."dbg_delete_profile_sim"("p_profile_id" "uuid", "p_caller" "uuid", "p_delete_auth" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_get_caller_info"() RETURNS TABLE("caller_uid" "text", "caller_company" "uuid")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT auth.uid()::text AS caller_uid,
    (SELECT company FROM public.profiles WHERE user::text = auth.uid()::text LIMIT 1) AS caller_company;
$$;


ALTER FUNCTION "public"."debug_get_caller_info"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_list_pg_triggers_profiles"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT jsonb_agg(row_to_json(q)) FROM (
    SELECT t.tgname, p.proname as function_name, n.nspname as function_schema, t.tgenabled
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE t.tgrelid = 'public.profiles'::regclass
  ) q;
$$;


ALTER FUNCTION "public"."debug_list_pg_triggers_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_list_profiles_triggers"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT jsonb_agg(row_to_json(t)) FROM information_schema.triggers t WHERE t.event_object_table = 'profiles';
$$;


ALTER FUNCTION "public"."debug_list_profiles_triggers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_event_json"("p_payload" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."delete_event_json"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_profile_rpc"("p_profile_id" "uuid", "p_delete_auth" boolean DEFAULT true) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."delete_profile_rpc"("p_profile_id" "uuid", "p_delete_auth" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_set_program_exercise_notes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, pg_temp'
    AS $$
BEGIN
  -- If notes is empty or NULL, attempt to copy description from exercises table
  IF (NEW.notes IS NULL OR TRIM(NEW.notes) = '') THEN
    NEW.notes := (SELECT description FROM public.exercises WHERE id = NEW.exercise LIMIT 1);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_set_program_exercise_notes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_event_attendee_profiles"("p_event" "uuid") RETURNS TABLE("id" "uuid", "user" "uuid", "name" "text", "last_name" "text", "photo_path" "text", "sport" "text", "class_credits" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT p.id, p."user", p.name, p.last_name, p.photo_path, p.sport, p.class_credits
  FROM public.events e
  JOIN public.profiles p ON (p.id = ANY(e.client) OR p."user" = ANY(e.client))
  WHERE e.id = p_event
    AND p.company = e.company;
$$;


ALTER FUNCTION "public"."get_event_attendee_profiles"("p_event" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_events_for_company"("p_company" "uuid") RETURNS TABLE("id" "uuid", "company" "uuid", "datetime" "text", "duration" integer, "type" "text", "client" "uuid"[], "professional" "uuid"[], "notes" "text", "cost" numeric, "paid" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."get_events_for_company"("p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[]) RETURNS TABLE("id" "uuid", "user" "uuid", "name" "text", "last_name" "text", "photo_path" "text", "sport" "text", "class_credits" integer, "dni" "text", "phone" "text", "email" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits, dni, phone, email
  FROM public.profiles
  WHERE (id = ANY(p_ids) OR "user" = ANY(p_ids))
    AND company = (
      SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1
    );
$$;


ALTER FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[], "p_company" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "user" "uuid", "name" "text", "last_name" "text", "photo_path" "text", "sport" "text", "class_credits" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits
  FROM public.profiles
  WHERE (id = ANY(p_ids) OR "user" = ANY(p_ids))
    AND company = COALESCE(
      p_company,
      (SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1)
    );
$$;


ALTER FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[], "p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[]) RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "last_name" "text", "email" "text", "phone" "text", "photo_path" "text", "role" "text", "company" "uuid", "class_credits" integer)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[], "p_company" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "user" "uuid", "name" "text", "last_name" "text", "photo_path" "text", "sport" "text", "class_credits" integer, "dni" "text", "phone" "text", "email" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits, dni, phone, email
  FROM public.profiles
  WHERE (id = ANY(p_ids) OR "user" = ANY(p_ids))
    AND role = 'professional'
    AND company = COALESCE(
      p_company,
      (SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1)
    );
$$;


ALTER FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[], "p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "last_name" "text", "photo_path" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT p.id, p.user AS user_id, p.name, p.last_name, p.photo_path
  FROM public.profiles p
  WHERE p.role = p_role
    AND public.is_member_of_company(p.company);
$$;


ALTER FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text", "p_company" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "user" "uuid", "name" "text", "last_name" "text", "photo_path" "text", "sport" "text", "class_credits" integer, "dni" "text", "phone" "text", "email" "text", "address" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits, dni, phone, email, address
  FROM public.profiles
  WHERE role = p_role
    AND company = COALESCE(
      p_company,
      (SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1)
    )
  ORDER BY name;
$$;


ALTER FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text", "p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "last_name" "text", "email" "text", "phone" "text", "photo_path" "text", "role" "text", "company" "uuid", "class_credits" integer)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text", "p_company" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "user" "uuid", "name" "text", "last_name" "text", "photo_path" "text", "sport" "text", "class_credits" integer, "dni" "text", "phone" "text", "email" "text", "address" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT id, "user", name, last_name, photo_path, sport, class_credits, dni, phone, email, address
  FROM public.profiles
  WHERE role = p_role
    AND company = COALESCE(
      p_company,
      (SELECT company FROM public.profiles WHERE "user" = auth.uid() LIMIT 1)
    )
  ORDER BY name;
$$;


ALTER FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text", "p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_for_professionals"() RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "last_name" "text", "email" "text", "phone" "text", "photo_path" "text", "role" "text", "company" "uuid", "class_credits" integer)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT p.id, p.user AS user_id, p.name, p.last_name, p.email, p.phone, p.photo_path, p.role, p.company, p.class_credits
  FROM public.profiles p
  WHERE public.is_member_of_company(p.company)
    AND EXISTS (
      SELECT 1 FROM public.profiles pu
      WHERE pu.user::text = auth.uid()::text
        AND pu.role = 'professional'
        AND pu.company IS NOT DISTINCT FROM p.company
    );
$$;


ALTER FUNCTION "public"."get_profiles_for_professionals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_policies"() RETURNS TABLE("polname" "text", "using_expr" "text", "with_check" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
  SELECT polname,
         pg_get_expr(polqual, polrelid) AS using_expr,
         pg_get_expr(polwithcheck, polrelid) AS with_check
  FROM pg_policy
  WHERE polrelid = 'public.profiles'::regclass;
$$;


ALTER FUNCTION "public"."get_profiles_policies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_event_json"("p_payload" "jsonb") RETURNS TABLE("id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."insert_event_json"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_member_of_company"("p_company" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p."user" = auth.uid() OR p.id = auth.uid() OR p.user::text = auth.uid()::text)
      AND p.company = p_company
  );
$$;


ALTER FUNCTION "public"."is_member_of_company"("p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_professional_of_company"("p_company" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p."user" = auth.uid() OR p.id = auth.uid() OR p.user::text = auth.uid()::text)
      AND p.company = p_company
  );
$$;


ALTER FUNCTION "public"."is_professional_of_company"("p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_profile_admin_of"("company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user = auth.uid() AND p.role = 'admin' AND p.company = company_id
  );
$$;


ALTER FUNCTION "public"."is_profile_admin_of"("company_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_profile_member_of"("company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p.user = auth.uid() OR p.id = auth.uid()) AND p.company = company_id
  );
$$;


ALTER FUNCTION "public"."is_profile_member_of"("company_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_profile_professional_or_admin_of"("p_company" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (p."user" = auth.uid() OR p.id = auth.uid())
      AND p.company = p_company
      AND (p.role = 'professional' OR p.role = 'admin')
  );
$$;


ALTER FUNCTION "public"."is_profile_professional_or_admin_of"("p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_same_company"("p_company" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
BEGIN
  -- Security Definer (owner: postgres) bypasses RLS on profiles, breaking recursion
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE ("user" = auth.uid() OR id = auth.uid())
      AND company = p_company
  );
END;
$$;


ALTER FUNCTION "public"."is_same_company"("p_company" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_role_escalation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."prevent_role_escalation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_reminder_on_event_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
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
$$;


ALTER FUNCTION "public"."reset_reminder_on_event_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."unlink_deleted_anatomy_from_exercises"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Remove the deleted anatomy id from any exercise arrays
  UPDATE public.exercises ex
  SET anatomy = array_remove(ex.anatomy, OLD.id)
  WHERE OLD.id = ANY (ex.anatomy);
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."unlink_deleted_anatomy_from_exercises"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."unlink_deleted_equipment_from_exercises"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Remove the deleted equipment id from any exercise arrays
  UPDATE public.exercises ex
  SET equipment = array_remove(ex.equipment, OLD.id)
  WHERE OLD.id = ANY (ex.equipment);
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."unlink_deleted_equipment_from_exercises"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_event_json"("p_payload" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public, pg_temp'
    AS $$
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
$$;


ALTER FUNCTION "public"."update_event_json"("p_payload" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."clinics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "subscription_status" "text",
    "stripe_trial_end" timestamp with time zone,
    "manual_premium" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."clinics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_id" "uuid",
    "job_description" "text",
    "laboratory_id" "uuid",
    "specialist_id" "uuid",
    "order_date" timestamp with time zone,
    "status" "text" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['En laboratorio'::"text", 'En clinica (sin citar)'::"text", 'En clinica (citado)'::"text", 'Cerrado'::"text"])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."laboratories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "clinic_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."laboratories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "code" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."patients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."specialists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "specialty" "text",
    "phone" "text",
    "email" "text",
    "clinic_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."specialists" OWNER TO "postgres";


ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."laboratories"
    ADD CONSTRAINT "laboratories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."specialists"
    ADD CONSTRAINT "specialists_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_jobs_clinic_id" ON "public"."jobs" USING "btree" ("clinic_id");



CREATE INDEX "idx_jobs_patient_id" ON "public"."jobs" USING "btree" ("patient_id");



CREATE INDEX "idx_laboratories_clinic_id" ON "public"."laboratories" USING "btree" ("clinic_id");



CREATE INDEX "idx_patients_clinic_id" ON "public"."patients" USING "btree" ("clinic_id");



CREATE INDEX "idx_specialists_clinic_id" ON "public"."specialists" USING "btree" ("clinic_id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_laboratory_id_fkey" FOREIGN KEY ("laboratory_id") REFERENCES "public"."laboratories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "public"."specialists"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."laboratories"
    ADD CONSTRAINT "laboratories_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."specialists"
    ADD CONSTRAINT "specialists_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



CREATE POLICY "Clinics are managed by owner" ON "public"."clinics" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Jobs are scoped to clinic" ON "public"."jobs" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"()))))))) WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"())))))));



CREATE POLICY "Laboratories are scoped to clinic" ON "public"."laboratories" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"()))))))) WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"())))))));



CREATE POLICY "Patients are scoped to clinic" ON "public"."patients" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"()))))))) WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"())))))));



CREATE POLICY "Specialists are scoped to clinic" ON "public"."specialists" USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"()))))))) WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE (("clinics"."user_id" = "auth"."uid"()) AND (("clinics"."subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text"])) OR (("clinics"."stripe_trial_end" IS NOT NULL) AND ("clinics"."stripe_trial_end" > "now"())))))));



ALTER TABLE "public"."clinics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."laboratories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."specialists" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."accept_invite"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_invite"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_invite"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."accept_invite_debug"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_invite_debug"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_invite_debug"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."accept_invite_http"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_invite_http"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_invite_http"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."accept_invite_verbose"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_invite_verbose"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_invite_verbose"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."adjust_class_credits_on_events_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."adjust_class_credits_on_events_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."adjust_class_credits_on_events_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."as_uuid_array"("_val" "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_subscription_status"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_subscription_status"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_subscription_status"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_auth_user_for_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_auth_user_for_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_auth_user_for_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."dbg_accept_invite_sim"("p_token" "uuid", "p_caller" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."dbg_accept_invite_sim"("p_token" "uuid", "p_caller" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."dbg_accept_invite_sim"("p_token" "uuid", "p_caller" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."dbg_delete_profile_sim"("p_profile_id" "uuid", "p_caller" "uuid", "p_delete_auth" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."dbg_delete_profile_sim"("p_profile_id" "uuid", "p_caller" "uuid", "p_delete_auth" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dbg_delete_profile_sim"("p_profile_id" "uuid", "p_caller" "uuid", "p_delete_auth" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_get_caller_info"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_get_caller_info"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_get_caller_info"() TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_list_pg_triggers_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_list_pg_triggers_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_list_pg_triggers_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_list_profiles_triggers"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_list_profiles_triggers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_list_profiles_triggers"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_event_json"("p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_event_json"("p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_event_json"("p_payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_profile_rpc"("p_profile_id" "uuid", "p_delete_auth" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_profile_rpc"("p_profile_id" "uuid", "p_delete_auth" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_profile_rpc"("p_profile_id" "uuid", "p_delete_auth" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_set_program_exercise_notes"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_set_program_exercise_notes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_set_program_exercise_notes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_event_attendee_profiles"("p_event" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_event_attendee_profiles"("p_event" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_event_attendee_profiles"("p_event" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_events_for_company"("p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_events_for_company"("p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_events_for_company"("p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[], "p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[], "p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_clients"("p_ids" "uuid"[], "p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[], "p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[], "p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_by_ids_for_professionals"("p_ids" "uuid"[], "p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text", "p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text", "p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_clients"("p_role" "text", "p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text", "p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text", "p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_by_role_for_professionals"("p_role" "text", "p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_for_professionals"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_for_professionals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_for_professionals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_policies"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_policies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_policies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_event_json"("p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_event_json"("p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_event_json"("p_payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_member_of_company"("p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_member_of_company"("p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_member_of_company"("p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_professional_of_company"("p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_professional_of_company"("p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_professional_of_company"("p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_profile_admin_of"("company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_profile_admin_of"("company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_profile_admin_of"("company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_profile_member_of"("company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_profile_member_of"("company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_profile_member_of"("company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_profile_professional_or_admin_of"("p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_profile_professional_or_admin_of"("p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_profile_professional_or_admin_of"("p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_same_company"("p_company" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_same_company"("p_company" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_same_company"("p_company" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_role_escalation"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_role_escalation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_role_escalation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_reminder_on_event_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_reminder_on_event_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_reminder_on_event_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unlink_deleted_anatomy_from_exercises"() TO "anon";
GRANT ALL ON FUNCTION "public"."unlink_deleted_anatomy_from_exercises"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unlink_deleted_anatomy_from_exercises"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unlink_deleted_equipment_from_exercises"() TO "anon";
GRANT ALL ON FUNCTION "public"."unlink_deleted_equipment_from_exercises"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unlink_deleted_equipment_from_exercises"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_event_json"("p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_json"("p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_json"("p_payload" "jsonb") TO "service_role";
























GRANT ALL ON TABLE "public"."clinics" TO "anon";
GRANT ALL ON TABLE "public"."clinics" TO "authenticated";
GRANT ALL ON TABLE "public"."clinics" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."laboratories" TO "anon";
GRANT ALL ON TABLE "public"."laboratories" TO "authenticated";
GRANT ALL ON TABLE "public"."laboratories" TO "service_role";



GRANT ALL ON TABLE "public"."patients" TO "anon";
GRANT ALL ON TABLE "public"."patients" TO "authenticated";
GRANT ALL ON TABLE "public"."patients" TO "service_role";



GRANT ALL ON TABLE "public"."specialists" TO "anon";
GRANT ALL ON TABLE "public"."specialists" TO "authenticated";
GRANT ALL ON TABLE "public"."specialists" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































