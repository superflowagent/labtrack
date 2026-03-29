WITH duplicated_notifications AS (
    SELECT ctid,
           ROW_NUMBER() OVER (
               PARTITION BY job_id, recipient_role, type
               ORDER BY created_at ASC, id ASC
           ) AS row_number
    FROM public.notifications
    WHERE (type = 'job_elapsed_ten_days' AND job_id IS NOT NULL)
)
DELETE FROM public.notifications
WHERE ctid IN (
    SELECT ctid
    FROM duplicated_notifications
    WHERE row_number > 1
);

UPDATE public.notifications
SET title = REPLACE(title, '10 dias', '10 días'),
    body = REPLACE(body, '10 dias', '10 días')
WHERE type = 'job_elapsed_ten_days';

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_job_elapsed_ten_days_unique
    ON public.notifications (job_id, recipient_role, type)
    WHERE (type = 'job_elapsed_ten_days' AND job_id IS NOT NULL);

DROP POLICY IF EXISTS "Laboratory can create own laboratory notifications" ON public.notifications;

CREATE POLICY "Laboratory can create own laboratory notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (
        (recipient_role = 'laboratory'::text)
        AND (laboratory_id IN (
            SELECT laboratory_users.laboratory_id
            FROM public.laboratory_users
            WHERE ((laboratory_users.user_id = auth.uid()) AND laboratory_users.is_active)
        ))
        AND (clinic_id IN (
            SELECT laboratory_users.clinic_id
            FROM public.laboratory_users
            WHERE ((laboratory_users.user_id = auth.uid()) AND laboratory_users.is_active)
        ))
    );