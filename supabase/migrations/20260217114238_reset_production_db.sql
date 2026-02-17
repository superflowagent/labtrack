-- Cleanup: Drop all tables and functions from incorrect project schema only
-- Baseline tables will remain intact if they exist

-- Drop tables from incorrect project schema (if they exist)
DROP TABLE IF EXISTS "public"."program_exercises" CASCADE;
DROP TABLE IF EXISTS "public"."programs" CASCADE;
DROP TABLE IF EXISTS "public"."profiles" CASCADE;
DROP TABLE IF EXISTS "public"."invoices" CASCADE;
DROP TABLE IF EXISTS "public"."exercises" CASCADE;
DROP TABLE IF EXISTS "public"."events" CASCADE;
DROP TABLE IF EXISTS "public"."equipment" CASCADE;
DROP TABLE IF EXISTS "public"."companies" CASCADE;
DROP TABLE IF EXISTS "public"."classes_templates" CASCADE;
DROP TABLE IF EXISTS "public"."app_settings" CASCADE;
DROP TABLE IF EXISTS "public"."anatomy" CASCADE;

-- Drop all functions from incorrect project
DROP FUNCTION IF EXISTS "public"."accept_invite"(p_token text) CASCADE;
DROP FUNCTION IF EXISTS "public"."accept_invite_debug"(p_token text) CASCADE;
DROP FUNCTION IF EXISTS "public"."accept_invite_http"(p_token text) CASCADE;
DROP FUNCTION IF EXISTS "public"."accept_invite_verbose"(p_token text) CASCADE;
DROP FUNCTION IF EXISTS "public"."adjust_class_credits_on_events_change"() CASCADE;
DROP FUNCTION IF EXISTS "public"."as_uuid_array"(_val uuid[]) CASCADE;
DROP FUNCTION IF EXISTS "public"."as_uuid_array"(_val anyarray) CASCADE;
DROP FUNCTION IF EXISTS "public"."as_uuid_array"(_val anyelement) CASCADE;
DROP FUNCTION IF EXISTS "public"."check_subscription_status"(user_email text) CASCADE;
DROP FUNCTION IF EXISTS "public"."create_auth_user_for_profile"() CASCADE;
DROP FUNCTION IF EXISTS "public"."dbg_accept_invite_sim"(p_token uuid, p_caller uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."dbg_delete_profile_sim"(p_profile_id uuid, p_caller uuid, p_delete_auth boolean) CASCADE;
DROP FUNCTION IF EXISTS "public"."debug_get_caller_info"() CASCADE;
DROP FUNCTION IF EXISTS "public"."debug_list_pg_triggers_profiles"() CASCADE;
DROP FUNCTION IF EXISTS "public"."debug_list_profiles_triggers"() CASCADE;
DROP FUNCTION IF EXISTS "public"."delete_event_json"(p_payload jsonb) CASCADE;
DROP FUNCTION IF EXISTS "public"."delete_profile_rpc"(p_profile_id uuid, p_delete_auth boolean) CASCADE;
DROP FUNCTION IF EXISTS "public"."fn_set_program_exercise_notes"() CASCADE;
DROP FUNCTION IF EXISTS "public"."get_event_attendee_profiles"(p_event uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_events_for_company"(p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_by_ids_for_clients"(p_ids uuid[]) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_by_ids_for_clients"(p_ids uuid[], p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_by_ids_for_professionals"(p_ids uuid[]) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_by_ids_for_professionals"(p_ids uuid[], p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_by_role_for_clients"(p_role text) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_by_role_for_clients"(p_role text, p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_by_role_for_professionals"(p_role text) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_by_role_for_professionals"(p_role text, p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_for_professionals"() CASCADE;
DROP FUNCTION IF EXISTS "public"."get_profiles_policies"() CASCADE;
DROP FUNCTION IF EXISTS "public"."insert_event_json"(p_payload jsonb) CASCADE;
DROP FUNCTION IF EXISTS "public"."is_member_of_company"(p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."is_professional_of_company"(p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."is_profile_admin_of"(company_id uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."is_profile_member_of"(company_id uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."is_profile_professional_or_admin_of"(p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."is_same_company"(p_company uuid) CASCADE;
DROP FUNCTION IF EXISTS "public"."prevent_role_escalation"() CASCADE;
DROP FUNCTION IF EXISTS "public"."reset_reminder_on_event_change"() CASCADE;
DROP FUNCTION IF EXISTS "public"."unlink_deleted_anatomy_from_exercises"() CASCADE;
DROP FUNCTION IF EXISTS "public"."unlink_deleted_equipment_from_exercises"() CASCADE;
DROP FUNCTION IF EXISTS "public"."update_event_json"(p_payload jsonb) CASCADE;
