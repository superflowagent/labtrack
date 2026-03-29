ALTER TABLE "public"."jobs"
    ADD COLUMN IF NOT EXISTS "clinic_last_viewed_comment_at" timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "laboratory_last_viewed_comment_at" timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "last_comment_at" timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "last_comment_by_role" text;

ALTER TABLE "public"."jobs"
    DROP CONSTRAINT IF EXISTS "jobs_last_comment_by_role_check";

ALTER TABLE "public"."jobs"
    ADD CONSTRAINT "jobs_last_comment_by_role_check"
    CHECK (("last_comment_by_role" IS NULL) OR ("last_comment_by_role" = ANY (ARRAY['clinic'::text, 'laboratory'::text])));

CREATE TABLE IF NOT EXISTS "public"."job_comments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "job_id" uuid NOT NULL,
    "clinic_id" uuid NOT NULL,
    "laboratory_id" uuid NOT NULL,
    "sender_role" text NOT NULL,
    "body" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "job_comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "job_comments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    CONSTRAINT "job_comments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE,
    CONSTRAINT "job_comments_laboratory_id_fkey" FOREIGN KEY ("laboratory_id") REFERENCES "public"."laboratories"("id") ON DELETE CASCADE,
    CONSTRAINT "job_comments_sender_role_check" CHECK (("sender_role" = ANY (ARRAY['clinic'::text, 'laboratory'::text]))),
    CONSTRAINT "job_comments_body_not_blank_check" CHECK ((length(btrim("body")) > 0))
);

CREATE INDEX IF NOT EXISTS "idx_job_comments_job_created" ON "public"."job_comments" USING btree ("job_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_jobs_last_comment_at" ON "public"."jobs" USING btree ("last_comment_at" DESC);

CREATE OR REPLACE FUNCTION "public"."sync_job_comment_state"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.jobs
    SET last_comment_at = NEW.created_at,
        last_comment_by_role = NEW.sender_role,
        clinic_last_viewed_comment_at = CASE
            WHEN NEW.sender_role = 'clinic' THEN GREATEST(COALESCE(clinic_last_viewed_comment_at, '-infinity'::timestamptz), NEW.created_at)
            ELSE clinic_last_viewed_comment_at
        END,
        laboratory_last_viewed_comment_at = CASE
            WHEN NEW.sender_role = 'laboratory' THEN GREATEST(COALESCE(laboratory_last_viewed_comment_at, '-infinity'::timestamptz), NEW.created_at)
            ELSE laboratory_last_viewed_comment_at
        END
    WHERE id = NEW.job_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_sync_job_comment_state" ON "public"."job_comments";

CREATE TRIGGER "trg_sync_job_comment_state"
AFTER INSERT ON "public"."job_comments"
FOR EACH ROW
EXECUTE FUNCTION "public"."sync_job_comment_state"();

ALTER TABLE "public"."job_comments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic can read job comments" ON "public"."job_comments"
    FOR SELECT
    USING (("clinic_id" IN (
        SELECT "clinics"."id"
        FROM "public"."clinics"
        WHERE ("clinics"."user_id" = auth.uid())
    )));

CREATE POLICY "Clinic can insert job comments" ON "public"."job_comments"
    FOR INSERT
    WITH CHECK (("sender_role" = 'clinic'::text) AND ("clinic_id" IN (
        SELECT "clinics"."id"
        FROM "public"."clinics"
        WHERE ("clinics"."user_id" = auth.uid())
    )));

CREATE POLICY "Laboratory can read own job comments" ON "public"."job_comments"
    FOR SELECT
    USING (("laboratory_id" IN (
        SELECT "laboratory_users"."laboratory_id"
        FROM "public"."laboratory_users"
        WHERE (("laboratory_users"."user_id" = auth.uid()) AND "laboratory_users"."is_active")
    )));

CREATE POLICY "Laboratory can insert own job comments" ON "public"."job_comments"
    FOR INSERT
    WITH CHECK (("sender_role" = 'laboratory'::text) AND ("laboratory_id" IN (
        SELECT "laboratory_users"."laboratory_id"
        FROM "public"."laboratory_users"
        WHERE (("laboratory_users"."user_id" = auth.uid()) AND "laboratory_users"."is_active")
    )) AND ("clinic_id" IN (
        SELECT "laboratory_users"."clinic_id"
        FROM "public"."laboratory_users"
        WHERE (("laboratory_users"."user_id" = auth.uid()) AND "laboratory_users"."is_active")
    )));

GRANT ALL ON TABLE "public"."job_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."job_comments" TO "service_role";
GRANT ALL ON FUNCTION "public"."sync_job_comment_state"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_job_comment_state"() TO "service_role";
