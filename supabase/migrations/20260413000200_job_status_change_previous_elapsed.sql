ALTER TABLE "public"."job_comments"
    ADD COLUMN IF NOT EXISTS "previous_status_elapsed_seconds" integer;

CREATE OR REPLACE FUNCTION "public"."insert_job_status_change_comment"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    actor_role text;
    actor_name text;
    previous_elapsed_seconds integer;
BEGIN
    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
        RETURN NEW;
    END IF;

    IF NEW.laboratory_id IS NULL THEN
        RETURN NEW;
    END IF;

    previous_elapsed_seconds := GREATEST(
        0,
        FLOOR(
            EXTRACT(
                EPOCH FROM (
                    COALESCE(OLD.status_timer_stopped_at, now())
                    - COALESCE(OLD.status_timer_started_at, OLD.order_date, OLD.created_at, now())
                )
            )
        )::integer
    );

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
        next_status,
        previous_status_elapsed_seconds
    ) VALUES (
        NEW.id,
        NEW.clinic_id,
        NEW.laboratory_id,
        actor_role,
        format('%s ha cambiado el estado de %s a %s.', actor_name, OLD.status, NEW.status),
        'status_change',
        actor_name,
        OLD.status,
        NEW.status,
        previous_elapsed_seconds
    );

    RETURN NEW;
END;
$$;

GRANT ALL ON FUNCTION "public"."insert_job_status_change_comment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_job_status_change_comment"() TO "service_role";