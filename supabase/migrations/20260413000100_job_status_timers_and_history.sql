ALTER TABLE "public"."jobs"
    ADD COLUMN IF NOT EXISTS "status_timer_started_at" timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "status_timer_stopped_at" timestamp with time zone;

UPDATE "public"."jobs"
SET "status_timer_started_at" = COALESCE("status_timer_started_at", "order_date", "created_at", now()),
    "status_timer_stopped_at" = CASE
        WHEN "status" = 'Cerrado' THEN COALESCE("status_timer_stopped_at", now())
        ELSE NULL
    END
WHERE "status_timer_started_at" IS NULL
   OR ("status" = 'Cerrado' AND "status_timer_stopped_at" IS NULL)
   OR ("status" <> 'Cerrado' AND "status_timer_stopped_at" IS NOT NULL);

ALTER TABLE "public"."job_comments"
    ADD COLUMN IF NOT EXISTS "comment_kind" text NOT NULL DEFAULT 'comment',
    ADD COLUMN IF NOT EXISTS "actor_display_name" text,
    ADD COLUMN IF NOT EXISTS "previous_status" text,
    ADD COLUMN IF NOT EXISTS "next_status" text;

ALTER TABLE "public"."job_comments"
    DROP CONSTRAINT IF EXISTS "job_comments_comment_kind_check";

ALTER TABLE "public"."job_comments"
    ADD CONSTRAINT "job_comments_comment_kind_check"
    CHECK (("comment_kind" = ANY (ARRAY['comment'::text, 'status_change'::text])));

ALTER TABLE "public"."job_comments"
    DROP CONSTRAINT IF EXISTS "job_comments_status_change_check";

ALTER TABLE "public"."job_comments"
    ADD CONSTRAINT "job_comments_status_change_check"
    CHECK (
        (
            "comment_kind" = 'comment'::text
            AND "previous_status" IS NULL
            AND "next_status" IS NULL
        )
        OR (
            "comment_kind" = 'status_change'::text
            AND "previous_status" IS NOT NULL
            AND "next_status" IS NOT NULL
            AND "actor_display_name" IS NOT NULL
        )
    );

CREATE OR REPLACE FUNCTION "public"."is_clinic_scheduling_transition"("previous_status" text, "next_status" text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT (
        ("previous_status" = 'En clínica (sin citar)' AND "next_status" = 'En clínica (citado)')
        OR ("previous_status" = 'En clínica (citado)' AND "next_status" = 'En clínica (sin citar)')
    );
$$;

CREATE OR REPLACE FUNCTION "public"."should_reset_job_status_timer"("previous_status" text, "next_status" text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN "previous_status" = "next_status" THEN false
        WHEN "next_status" = 'Cerrado' THEN false
        WHEN "public"."is_clinic_scheduling_transition"("previous_status", "next_status") THEN false
        ELSE true
    END;
$$;

CREATE OR REPLACE FUNCTION "public"."apply_job_status_timer_state"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.status_timer_started_at := COALESCE(NEW.status_timer_started_at, NEW.order_date, now());
        IF NEW.status = 'Cerrado' THEN
            NEW.status_timer_stopped_at := COALESCE(NEW.status_timer_stopped_at, now());
        ELSE
            NEW.status_timer_stopped_at := NULL;
        END IF;

        RETURN NEW;
    END IF;

    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
        RETURN NEW;
    END IF;

    IF NEW.status = 'Cerrado' THEN
        NEW.status_timer_started_at := COALESCE(OLD.status_timer_started_at, OLD.order_date, OLD.created_at, now());
        NEW.status_timer_stopped_at := now();
        RETURN NEW;
    END IF;

    IF "public"."should_reset_job_status_timer"(OLD.status, NEW.status) THEN
        NEW.status_timer_started_at := now();
        NEW.status_timer_stopped_at := NULL;
        NEW.ten_day_notification_sent_at := NULL;
        RETURN NEW;
    END IF;

    NEW.status_timer_started_at := COALESCE(OLD.status_timer_started_at, OLD.order_date, OLD.created_at, now());
    NEW.status_timer_stopped_at := NULL;
    NEW.ten_day_notification_sent_at := OLD.ten_day_notification_sent_at;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."insert_job_status_change_comment"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    actor_role text;
    actor_name text;
BEGIN
    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
        RETURN NEW;
    END IF;

    IF NEW.laboratory_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT 'clinic'::text, clinics.name
    INTO actor_role, actor_name
    FROM public.clinics
    WHERE clinics.user_id = auth.uid()
    LIMIT 1;

    IF actor_role IS NULL THEN
        SELECT 'laboratory'::text, laboratories.name
        INTO actor_role, actor_name
        FROM public.laboratory_users
        INNER JOIN public.laboratories ON laboratories.id = laboratory_users.laboratory_id
        WHERE laboratory_users.user_id = auth.uid()
          AND laboratory_users.is_active
          AND laboratory_users.laboratory_id = NEW.laboratory_id
        LIMIT 1;
    END IF;

    IF actor_role IS NULL OR actor_name IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.job_comments (
        job_id,
        clinic_id,
        laboratory_id,
        sender_role,
        body,
        comment_kind,
        actor_display_name,
        previous_status,
        next_status
    ) VALUES (
        NEW.id,
        NEW.clinic_id,
        NEW.laboratory_id,
        actor_role,
        format('%s ha cambiado el estado de %s a %s.', actor_name, OLD.status, NEW.status),
        'status_change',
        actor_name,
        OLD.status,
        NEW.status
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_apply_job_status_timer_state" ON "public"."jobs";

CREATE TRIGGER "trg_apply_job_status_timer_state"
BEFORE INSERT OR UPDATE OF "status" ON "public"."jobs"
FOR EACH ROW
EXECUTE FUNCTION "public"."apply_job_status_timer_state"();

DROP TRIGGER IF EXISTS "trg_insert_job_status_change_comment" ON "public"."jobs";

CREATE TRIGGER "trg_insert_job_status_change_comment"
AFTER UPDATE OF "status" ON "public"."jobs"
FOR EACH ROW
WHEN (OLD."status" IS DISTINCT FROM NEW."status")
EXECUTE FUNCTION "public"."insert_job_status_change_comment"();

CREATE INDEX IF NOT EXISTS "idx_jobs_status_timer_started_at" ON "public"."jobs" USING btree ("status_timer_started_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_jobs_status_timer_stopped_at" ON "public"."jobs" USING btree ("status_timer_stopped_at" DESC);

GRANT ALL ON FUNCTION "public"."is_clinic_scheduling_transition"(text, text) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_clinic_scheduling_transition"(text, text) TO "service_role";
GRANT ALL ON FUNCTION "public"."should_reset_job_status_timer"(text, text) TO "authenticated";
GRANT ALL ON FUNCTION "public"."should_reset_job_status_timer"(text, text) TO "service_role";
GRANT ALL ON FUNCTION "public"."apply_job_status_timer_state"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_job_status_timer_state"() TO "service_role";
GRANT ALL ON FUNCTION "public"."insert_job_status_change_comment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_job_status_change_comment"() TO "service_role";