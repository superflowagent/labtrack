ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS ten_day_notification_sent_at timestamp with time zone;

UPDATE public.notifications
SET title = 'Trabajo retrasado'
WHERE type = 'job_elapsed_ten_days';

UPDATE public.jobs AS jobs
SET ten_day_notification_sent_at = existing_notifications.first_created_at
FROM (
    SELECT job_id, MIN(created_at) AS first_created_at
    FROM public.notifications
    WHERE type = 'job_elapsed_ten_days'
      AND job_id IS NOT NULL
    GROUP BY job_id
) AS existing_notifications
WHERE jobs.id = existing_notifications.job_id
  AND jobs.ten_day_notification_sent_at IS NULL;