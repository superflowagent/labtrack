ALTER TABLE "public"."jobs"
    ADD COLUMN IF NOT EXISTS "shared_notes" "text";

ALTER TABLE "public"."jobs"
    DROP CONSTRAINT IF EXISTS "jobs_status_check";

ALTER TABLE "public"."jobs"
    ADD CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['En laboratorio'::"text", 'En envío'::"text", 'En clínica (sin citar)'::"text", 'En clínica (citado)'::"text", 'Cerrado'::"text"])));

CREATE TABLE IF NOT EXISTS "public"."laboratory_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "laboratory_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."laboratory_users"
    ADD CONSTRAINT "laboratory_users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."laboratory_users"
    ADD CONSTRAINT "laboratory_users_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."laboratory_users"
    ADD CONSTRAINT "laboratory_users_laboratory_id_fkey" FOREIGN KEY ("laboratory_id") REFERENCES "public"."laboratories"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."laboratory_users"
    ADD CONSTRAINT "laboratory_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."laboratory_users"
    ADD CONSTRAINT "laboratory_users_laboratory_id_key" UNIQUE ("laboratory_id");

ALTER TABLE ONLY "public"."laboratory_users"
    ADD CONSTRAINT "laboratory_users_user_id_key" UNIQUE ("user_id");

CREATE INDEX "idx_jobs_laboratory_status_order_date" ON "public"."jobs" USING "btree" ("laboratory_id", "status", "order_date");
CREATE INDEX "idx_laboratory_users_clinic_id" ON "public"."laboratory_users" USING "btree" ("clinic_id");
CREATE INDEX "idx_laboratory_users_user_id" ON "public"."laboratory_users" USING "btree" ("user_id");

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "laboratory_id" "uuid",
    "job_id" "uuid",
    "recipient_role" "text" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_recipient_role_check" CHECK (("recipient_role" = ANY (ARRAY['clinic'::"text", 'laboratory'::"text"])))
);

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_laboratory_id_fkey" FOREIGN KEY ("laboratory_id") REFERENCES "public"."laboratories"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;

CREATE INDEX "idx_notifications_clinic_role_read_created" ON "public"."notifications" USING "btree" ("clinic_id", "recipient_role", "read_at", "created_at" DESC);
CREATE INDEX "idx_notifications_lab_role_read_created" ON "public"."notifications" USING "btree" ("laboratory_id", "recipient_role", "read_at", "created_at" DESC);

CREATE POLICY "Laboratory users are scoped to clinic owner" ON "public"."laboratory_users"
    USING (("clinic_id" IN ( SELECT "clinics"."id"
       FROM "public"."clinics"
      WHERE ("clinics"."user_id" = "auth"."uid"()))))
    WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
       FROM "public"."clinics"
      WHERE ("clinics"."user_id" = "auth"."uid"()))));

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

CREATE POLICY "Laboratory user can read own laboratory" ON "public"."laboratories"
    FOR SELECT
    USING (("id" IN ( SELECT "laboratory_users"."laboratory_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active"))));

CREATE POLICY "Laboratory user can read assigned jobs" ON "public"."jobs"
    FOR SELECT
    USING (("laboratory_id" IN ( SELECT "laboratory_users"."laboratory_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active"))));

CREATE POLICY "Laboratory user can update assigned jobs" ON "public"."jobs"
    FOR UPDATE
    USING (("laboratory_id" IN ( SELECT "laboratory_users"."laboratory_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active"))))
    WITH CHECK (("laboratory_id" IN ( SELECT "laboratory_users"."laboratory_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active"))));

CREATE POLICY "Laboratory user can read assigned patients" ON "public"."patients"
    FOR SELECT
    USING ((EXISTS ( SELECT 1
       FROM ("public"."jobs" "jobs"
         JOIN "public"."laboratory_users" "laboratory_users" ON (("laboratory_users"."laboratory_id" = "jobs"."laboratory_id")))
      WHERE (("jobs"."patient_id" = "patients"."id") AND ("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active"))));

ALTER TABLE "public"."laboratory_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic can manage notifications" ON "public"."notifications"
    USING (("clinic_id" IN ( SELECT "clinics"."id"
       FROM "public"."clinics"
      WHERE ("clinics"."user_id" = "auth"."uid"()))))
    WITH CHECK (("clinic_id" IN ( SELECT "clinics"."id"
       FROM "public"."clinics"
      WHERE ("clinics"."user_id" = "auth"."uid"()))));

CREATE POLICY "Laboratory can read own notifications" ON "public"."notifications"
    FOR SELECT
    USING ((("recipient_role" = 'laboratory'::"text") AND ("laboratory_id" IN ( SELECT "laboratory_users"."laboratory_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active")))));

CREATE POLICY "Laboratory can update own notifications" ON "public"."notifications"
    FOR UPDATE
    USING ((("recipient_role" = 'laboratory'::"text") AND ("laboratory_id" IN ( SELECT "laboratory_users"."laboratory_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active")))))
    WITH CHECK ((("recipient_role" = 'laboratory'::"text") AND ("laboratory_id" IN ( SELECT "laboratory_users"."laboratory_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active")))));

CREATE POLICY "Laboratory can create clinic notifications" ON "public"."notifications"
    FOR INSERT
    WITH CHECK ((("recipient_role" = 'clinic'::"text") AND ("laboratory_id" IN ( SELECT "laboratory_users"."laboratory_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active"))) AND ("clinic_id" IN ( SELECT "laboratory_users"."clinic_id"
       FROM "public"."laboratory_users"
      WHERE (("laboratory_users"."user_id" = "auth"."uid"()) AND "laboratory_users"."is_active")))));

GRANT ALL ON TABLE "public"."laboratory_users" TO "authenticated";
GRANT ALL ON TABLE "public"."laboratory_users" TO "service_role";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";
GRANT ALL ON FUNCTION "public"."is_active_laboratory_user_for_clinic"("target_clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_active_laboratory_user_for_clinic"("target_clinic_id" "uuid") TO "service_role";
