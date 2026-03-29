DROP POLICY IF EXISTS "Laboratory user can read own clinic" ON "public"."clinics";
DROP POLICY IF EXISTS "Laboratory user can read own access" ON "public"."laboratory_users";

CREATE OR REPLACE FUNCTION "public"."is_active_laboratory_user_for_clinic"("target_clinic_id" "uuid")
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.laboratory_users
    WHERE laboratory_users.clinic_id = target_clinic_id
      AND laboratory_users.user_id = auth.uid()
      AND laboratory_users.is_active
  );
$$;

ALTER FUNCTION "public"."is_active_laboratory_user_for_clinic"("target_clinic_id" "uuid") OWNER TO postgres;

CREATE POLICY "Laboratory user can read own clinic" ON "public"."clinics"
    FOR SELECT
    USING ("public"."is_active_laboratory_user_for_clinic"("id"));

CREATE POLICY "Laboratory user can read own access" ON "public"."laboratory_users"
    FOR SELECT
    USING (("user_id" = "auth"."uid"()));

GRANT ALL ON FUNCTION "public"."is_active_laboratory_user_for_clinic"("target_clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_active_laboratory_user_for_clinic"("target_clinic_id" "uuid") TO "service_role";
